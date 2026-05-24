import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAiDatasetSummary } from './dataProcessor';

// System instruction prompt to guide Gemini on how to act and how to use the data summary
const getSystemInstructions = () => {
  const summary = generateAiDatasetSummary();
  return `You are a professional Property Tax Analytics Assistant for the UPYOG multi-tenant platform.
The UPYOG platform serves 10 Indian cities (Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow).
You have access to a dataset of 1,000 property records.

Here is the exact aggregated summary of the property data:
${summary}

YOUR GUIDELINES:
1. **Accuracy is Critical**: Use the exact numbers provided in the summary. For example, if asked "How many properties are rejected in Mumbai?", find "Mumbai" under "CITY-BY-CITY BREAKDOWN", read the "Rejected" count, and answer with that exact number.
2. **Formatting**: Always format your response using clean, beautiful markdown. Use bold text, bullet points, and tables where comparisons are requested (e.g., comparing Pune vs Jaipur registrations).
3. **Indian Rupees**: Display all financial figures in Indian Rupees (e.g., Rs. 15,450.50 or ₹15,450.50) using the Indian formatting style (lakhs/crores system if applicable, or standard comma groupings).
4. **Clarification**: If the question asks for details not present in the summary (e.g., specific owner addresses or details of an individual property ID like 'UPYOG-DEL-0001'), state that you have the overall summary stats and explain what you can answer, or answer based on the general data structure if possible.
5. **No Hallucinations**: Do not make up numbers. If a specific comparison is not available, calculate it if possible based on the raw metrics or state that it cannot be determined.
6. **Friendly & Professional**: Maintain an encouraging and professional tone. Highlight trends or interesting findings where appropriate (e.g., pointing out collection efficiency or high rates of pending applications).

Answer the user's question clearly, concisely, and based on the UPYOG dataset summary above.`;
};

/**
 * Sends a chat message to Gemini
 * @param {string} userMessage - The user's question.
 * @param {Array} chatHistory - Array of past messages (format: { role: 'user'|'model', text: string }).
 * @param {string} customApiKey - Optional custom API key provided in the UI.
 */
export async function askGemini(userMessage, chatHistory = [], customApiKey = '') {
  // Determine API key: check custom key first, then fallback to env
  const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  // Model fallback chain (since older models like gemini-1.5-flash are not supported on some newer keys in 2026)
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: getSystemInstructions(),
      });

      // Format chat history for Gemini API
      // Gemini API expects contents: [{ role: 'user' | 'model', parts: [{ text: string }] }]
      const contents = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.2, // Low temperature for factual consistency
        }
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Model ${modelName} failed or was unavailable. Error:`, error);
      lastError = error;

      // Fail immediately on authentication issues
      if (
        error.message && 
        (error.message.includes('API key not valid') || 
         error.message.includes('API_KEY_INVALID') ||
         (error.message.includes('API key') && error.message.includes('invalid')))
      ) {
        throw new Error('API_KEY_INVALID');
      }
    }
  }

  // If all models in the fallback chain fail, bubble up the error
  throw new Error(lastError?.message || 'API_CALL_FAILED');
}
