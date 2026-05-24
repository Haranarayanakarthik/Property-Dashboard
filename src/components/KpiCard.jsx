import React from 'react';

export default function KpiCard({ title, value, subtitle, icon: Icon, color, progress }) {
  // Determine color mapping
  const colorMap = {
    blue: {
      bg: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300',
      bar: 'bg-blue-500',
      glow: 'shadow-[0_0_20px_-3px_rgba(59,130,246,0.15)]',
    },
    green: {
      bg: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      bar: 'bg-emerald-500',
      glow: 'shadow-[0_0_20px_-3px_rgba(16,185,129,0.15)]',
    },
    red: {
      bg: 'from-rose-500/10 to-red-500/5 hover:border-rose-500/30',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
      bar: 'bg-rose-500',
      glow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.15)]',
    },
    purple: {
      bg: 'from-purple-500/10 to-fuchsia-500/5 hover:border-purple-500/30',
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300',
      bar: 'bg-purple-500',
      glow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.15)]',
    },
    amber: {
      bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/30',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300',
      bar: 'bg-amber-500',
      glow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.15)]',
    }
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${currentTheme.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${currentTheme.glow} group backdrop-blur-xl`}>
      {/* Background Decorative Glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-current opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-white transition-all duration-300 group-hover:scale-[1.02] origin-left">
            {value}
          </h3>
        </div>
        <div className={`rounded-xl p-3 ${currentTheme.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {(subtitle !== undefined || progress !== undefined) && (
        <div className="mt-5 space-y-2">
          {progress !== undefined && (
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${currentTheme.bar}`} 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">{subtitle}</span>
            {progress !== undefined && (
              <span className={`font-semibold ${currentTheme.text}`}>{progress}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
