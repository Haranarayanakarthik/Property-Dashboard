import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Wallet, 
  Clock, 
  Database, 
  TrendingUp, 
  Moon,
  Bot,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import KpiCard from './components/KpiCard';
import AnalyticsCharts from './components/AnalyticsCharts';
import PropertyTable from './components/PropertyTable';
import AiChatbot from './components/AiChatbot';
import { getKpis, CITIES } from './utils/dataProcessor';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('All');
  const [kpiData, setKpiData] = useState(getKpis('All'));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update KPIs whenever city filter changes
  useEffect(() => {
    setKpiData(getKpis(selectedCity));
  }, [selectedCity]);

  // Update time for real-time vibe
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100">
      {/* Background Animated Gradient Mesh */}
      <div className="bg-mesh" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-10 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Database className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">UPYOG</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">MUD Platform</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">Property Tax Analytics Dashboard</h1>
            </div>
          </div>

          {/* Time & Tenant Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Real-time Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="font-mono text-white">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            </div>

            {/* City Dropdown Filter */}
            <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1.5 transition-all focus-within:border-indigo-500">
              <label htmlFor="city-filter" className="text-xs text-slate-400 font-semibold whitespace-nowrap">Tenant Filter:</label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none text-xs text-white font-bold focus:outline-none cursor-pointer pr-4"
              >
                <option value="All" className="bg-slate-900 text-white">All Cities (10 Tenants)</option>
                {CITIES.map(city => (
                  <option key={city} value={city} className="bg-slate-900 text-white">{city}</option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Analytics Section (Left - 3/4 Width) */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <KpiCard
              title="Total Registered"
              value={kpiData.totalProperties.toLocaleString()}
              subtitle="All registered records"
              icon={Building2}
              color="blue"
            />
            
            <KpiCard
              title="Approved"
              value={kpiData.totalApproved.toLocaleString()}
              subtitle="Valid taxable properties"
              progress={kpiData.totalProperties > 0 ? Math.round((kpiData.totalApproved / kpiData.totalProperties) * 100) : 0}
              icon={CheckCircle2}
              color="green"
            />
            
            <KpiCard
              title="Rejected"
              value={kpiData.totalRejected.toLocaleString()}
              subtitle="Invalid registrations"
              progress={kpiData.totalProperties > 0 ? Math.round((kpiData.totalRejected / kpiData.totalProperties) * 100) : 0}
              icon={XCircle}
              color="red"
            />
            
            <KpiCard
              title="Total Collection"
              value={formatCurrency(kpiData.totalCollection)}
              subtitle={`Tax efficiency: ${kpiData.collectionEfficiency}%`}
              icon={Wallet}
              color="purple"
            />

          </div>

          {/* Tabbed Charts comparison */}
          <AnalyticsCharts selectedCity={selectedCity} />

          {/* Property Registry Explorer Grid */}
          <PropertyTable selectedCity={selectedCity} />

        </section>

        {/* AI Chat Copilot Section (Right - 1/4 Width) */}
        <section className="lg:col-span-1 lg:sticky lg:top-[92px] h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] min-h-[500px]">
          <AiChatbot />
        </section>

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-4 px-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>UPYOG Property Tax Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span>NUDM Intern Assessment 2026</span>
          </div>
          <div>
            Built with React, Tailwind CSS, Recharts, and Google Gemini 1.5 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
