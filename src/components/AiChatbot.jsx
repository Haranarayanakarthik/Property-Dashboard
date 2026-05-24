import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Key, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { askGemini } from '../utils/geminiService';
import confetti from 'canvas-confetti';

// Simple markdown formatter to display Gemini answers cleanly (bold, lists, tables)
function formatMarkdown(text) {
  if (!text) return '';

  let formatted = text;

  // Convert tables
  const lines = formatted.split('\n');
  let inTable = false;
  let tableRows = [];
  let tableHeaders = [];
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        // Skip separator line
        continue;
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
    } else {
      if (inTable) {
        // Render table
        let tableHtml = `<div class="overflow-x-auto my-3 border border-white/10 rounded-lg"><table class="w-full text-xs text-left border-collapse">`;
        tableHtml += `<thead><tr class="bg-slate-950/60 border-b border-white/10 text-indigo-300">` + 
          tableHeaders.map(h => `<th class="p-2 font-semibold">${h}</th>`).join('') + `</tr></thead>`;
        tableHtml += `<tbody class="divide-y divide-white/5">` + 
          tableRows.map(r => `<tr>` + r.map(cell => `<td class="p-2 text-slate-300">${cell}</td>`).join('') + `</tr>`).join('') + `</tbody></table></div>`;
        processedLines.push(tableHtml);
        
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      processedLines.push(lines[i]);
    }
  }
  // Flush remaining table
  if (inTable) {
    let tableHtml = `<div class="overflow-x-auto my-3 border border-white/10 rounded-lg"><table class="w-full text-xs text-left border-collapse">`;
    tableHtml += `<thead><tr class="bg-slate-950/60 border-b border-white/10 text-indigo-300">` + 
      tableHeaders.map(h => `<th class="p-2 font-semibold">${h}</th>`).join('') + `</tr></thead>`;
    tableHtml += `<tbody class="divide-y divide-white/5">` + 
      tableRows.map(r => `<tr>` + r.map(cell => `<td class="p-2 text-slate-300">${cell}</td>`).join('') + `</tr>`).join('') + `</tbody></table></div>`;
    processedLines.push(tableHtml);
  }

  formatted = processedLines.join('\n');

  // Convert bold: **text** -> <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 font-bold">$1</strong>');
  
  // Convert list items: - item -> <li>item</li>
  formatted = formatted.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>');

  // Convert paragraph spacing
  formatted = formatted.split('\n\n').map(p => {
    if (p.trim().startsWith('<div') || p.trim().startsWith('<li')) {
      return p;
    }
    return `<p class="mb-2 leading-relaxed">${p}</p>`;
  }).join('');

  return formatted;
}

export default function AiChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Namaste! I am your UPYOG Property Tax Assistant. Ask me anything about property registrations, approvals, rejections, or tax collections across the 10 tenants."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null); // 'KEY_MISSING' | 'KEY_INVALID' | 'GENERIC' | null
  
  const chatEndRef = useRef(null);

  // Load saved API key on startup
  useEffect(() => {
    const savedKey = localStorage.getItem('UPYOG_GEMINI_KEY')?.trim();
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      localStorage.removeItem('UPYOG_GEMINI_KEY'); // clean up any empty or spacing keys
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        setErrorStatus('KEY_MISSING');
        setShowKeyModal(true);
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('UPYOG_GEMINI_KEY', apiKey.trim());
      setShowKeyModal(false);
      setErrorStatus(null);
      // Trigger a light success confetti
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.9 }
      });
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('UPYOG_GEMINI_KEY');
    setApiKey('');
    setErrorStatus('KEY_MISSING');
    setShowKeyModal(true);
  };

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || loading) return;

    if (!apiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
      setErrorStatus('KEY_MISSING');
      setShowKeyModal(true);
      return;
    }

    // Append user message
    const userMsgObj = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsgObj]);
    setInputMessage('');
    setLoading(true);
    setErrorStatus(null);

    try {
      const response = await askGemini(msg, messages, apiKey);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      
      // Nice micro interaction: if answer contains success metrics, celebrate!
      if (msg.toLowerCase().includes('highest') || msg.toLowerCase().includes('compare')) {
        confetti({
          particleCount: 20,
          spread: 30,
          colors: ['#6366F1', '#38BDF8']
        });
      }
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setErrorStatus('KEY_MISSING');
        setShowKeyModal(true);
      } else if (err.message === 'API_KEY_INVALID') {
        setErrorStatus('KEY_INVALID');
        setShowKeyModal(true);
      } else {
        setErrorStatus('GENERIC');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `⚠️ Gemini API Error: ${err.message}. Please verify your connection or check if your API key is valid.` 
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: "Namaste! Chat reset complete. Let me know what data analysis you need me to perform."
      }
    ]);
    setErrorStatus(null);
  };

  const SUGGESTED_QUESTIONS = [
    "Which city has the highest total collection?",
    "How many properties are rejected in Mumbai?",
    "What percentage of Delhi properties are approved?",
    "Which city has the most pending properties?",
    "Compare total registrations between Pune and Jaipur."
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden relative min-h-[500px]">
      
      {/* Header panel */}
      <div className="bg-slate-950/60 p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              UPYOG AI Copilot
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </h3>
            <p className="text-[10px] text-slate-400">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Key Settings Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative ${
              errorStatus === 'KEY_MISSING' || errorStatus === 'KEY_INVALID' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : ''
            }`}
            title="Configure Gemini Key"
          >
            <Key className="h-4 w-4" />
            {(errorStatus === 'KEY_MISSING' || errorStatus === 'KEY_INVALID') && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </button>
          
          {/* Reset chat */}
          <button
            onClick={resetChat}
            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* API Key Modal Config Overlay */}
      {showKeyModal && (
        <div className="absolute inset-0 bg-slate-950/90 z-20 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Key className="h-5 w-5" />
              <h4 className="text-sm font-bold text-white">Gemini API Key Configuration</h4>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              To activate the AI Assistant, please enter your Gemini API Key. The key is processed purely client-side and saved securely in your browser's local storage.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste AI Studio Key here..."
                  className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-white/15 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {errorStatus === 'KEY_INVALID' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>The API key is invalid. Check for spaces.</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                {/* Cancel option if a key is already in env or local */}
                {(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('UPYOG_GEMINI_KEY')) && (
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
                
                {localStorage.getItem('UPYOG_GEMINI_KEY') && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    Delete Key
                  </button>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-500/20"
                >
                  Save and Connect
                </button>
              </div>
            </form>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] text-slate-500">
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 hover:text-indigo-400 hover:underline"
              >
                Get Free API Key <ExternalLink className="h-3 w-3" />
              </a>
              <span>Client-Side Only</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20 min-h-[300px]">
        
        {/* API Warning if local key is used */}
        {localStorage.getItem('UPYOG_GEMINI_KEY') && (
          <div className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              Using local developer API key
            </span>
            <button 
              onClick={handleClearKey} 
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Reset Key
            </button>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-2.5 animate-fade-in ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-1.5 text-indigo-400 flex-shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}

            <div 
              className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950/50 border border-white/5 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              ) : (
                <div 
                  className="prose prose-invert prose-xs max-w-none text-slate-200"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} 
                />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="rounded-lg bg-slate-800 border border-white/5 p-1.5 text-slate-300 flex-shrink-0">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {/* Loading / Typing Animation */}
        {loading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-1.5 text-indigo-400 flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-950/50 border border-white/5 flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              <span className="text-[10px] text-slate-400">Analyzing platform data...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Prompt Chips */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-2 bg-slate-950/30 border-t border-white/5 space-y-1.5">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Suggested Questions</p>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pb-1">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-indigo-600/35 border border-white/5 hover:border-indigo-500/30 px-2.5 py-1 rounded-lg transition-all text-left flex items-center justify-between group"
              >
                <span>{q}</span>
                <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Footer */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-slate-950/80 p-3 border-t border-white/5 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={loading ? "Analyzing..." : "Ask AI about properties data..."}
          disabled={loading}
          className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/25 flex items-center justify-center"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

    </div>
  );
}
