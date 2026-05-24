import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { getCityComparisonData, getPropertyTypeData } from '../utils/dataProcessor';

// Custom modern tooltip component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
        <p className="text-sm font-bold text-white mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-3 justify-between">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="text-xs font-semibold text-white">
                {formatter ? formatter(item.value) : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ selectedCity }) {
  const [activeTab, setActiveTab] = useState('revenue');
  const cityData = getCityComparisonData();
  const propertyTypeData = getPropertyTypeData(selectedCity);

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Color palette for property types
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#38BDF8'];

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header and Tab Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Data Visualizations</h3>
          <p className="text-xs text-slate-400 mt-1">
            {selectedCity === 'All' 
              ? 'Comparing all 10 platform tenants side-by-side' 
              : `Visualizing data for ${selectedCity} City`}
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'revenue'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Collections (City wise)
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'status'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Status Breakdown (Bonus)
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              activeTab === 'types'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Property Types
          </button>
        </div>
      </div>

      {/* Chart Render Window */}
      <div className="h-[400px] w-full min-h-[350px]">
        {activeTab === 'revenue' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cityData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="city" 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                dx={-10}
              />
              <Tooltip 
                content={<CustomTooltip formatter={formatCurrency} />}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
              />
              <Bar name="Total Tax Demand" dataKey="tax" fill="url(#colorTax)" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar name="Tax Collected" dataKey="collection" fill="url(#colorCollection)" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'status' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cityData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="city" 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
              />
              {/* Grouped Bar Chart showing Approved vs Rejected vs Pending */}
              <Bar name="Approved" dataKey="approved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar name="Pending" dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar name="Rejected" dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'types' && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            {/* Pie Chart Representation */}
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip formatter={(val) => `${val} properties`} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend & Details */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-white/5 pb-2">
                Property Category Distribution ({selectedCity === 'All' ? 'All Cities' : selectedCity})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propertyTypeData.map((item, index) => {
                  const total = propertyTypeData.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div 
                      key={item.name} 
                      className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-3 w-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <span className="text-xs font-semibold text-white">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-200">{item.value}</div>
                        <div className="text-[10px] text-slate-400">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
