import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Milk, Users, DollarSign } from 'lucide-react';
import { ApiClient } from '../../api/client';

export const ReportsView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    ApiClient.getReports().then(setData);
  }, []);

  if (!data) return <div className="p-8 text-slate-400 text-xs text-center">Loading Analytics...</div>;

  const COLORS = ['#1B4332', '#2D6A4F', '#52796F'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <h1 className="text-2xl font-bold text-[#081C15] tracking-tight">Business Reports</h1>
        <p className="text-xs text-[#52796F] mt-1">
          Revenue trends, milk delivery volume analysis, and customer growth metrics.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#52796F]">Monthly Revenue</span>
          <p className="text-2xl font-bold text-[#081C15] mt-1">₹{data.overview.monthlyRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#52796F]">Total Milk Volume</span>
          <p className="text-2xl font-bold text-[#081C15] mt-1">{data.overview.milkDeliveredLitres * 30} L / Mo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#52796F]">Active Subscriptions</span>
          <p className="text-2xl font-bold text-[#081C15] mt-1">{data.overview.activeCustomersCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <span className="text-xs font-semibold text-[#52796F]">Outstanding Due</span>
          <p className="text-2xl font-bold text-red-700 mt-1">₹{data.overview.outstandingBalanceTotal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-[#081C15] text-sm">Daily Revenue Trend (August 2026)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyRevenueSeries}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4332" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#52796F' }} />
                <YAxis tick={{ fontSize: 11, fill: '#52796F' }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#1B4332" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Milk Delivered Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-[#081C15] text-sm">Milk Quantity Delivered (Litres / Day)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyRevenueSeries}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#52796F' }} />
                <YAxis tick={{ fontSize: 11, fill: '#52796F' }} />
                <Tooltip formatter={(value) => [`${value} Litres`, 'Volume']} />
                <Bar dataKey="volume" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
