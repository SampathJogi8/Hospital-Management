import React, { useMemo } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PatientRecord } from '../../types';
import { Clock, CheckCircle2 } from 'lucide-react';

export const StaffShiftHeatmap: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const { chartData, shiftStats } = useMemo(() => {
    const stats = {
      Morning: { total: 0, resolved: 0, totalTime: 0 },
      Afternoon: { total: 0, resolved: 0, totalTime: 0 },
      Night: { total: 0, resolved: 0, totalTime: 0 }
    };
    
    data.forEach(d => {
      // Efficiency stats
      stats[d.Shift].total += 1;
      if (d.Resolution_Time !== null) {
        stats[d.Shift].resolved += 1;
        stats[d.Shift].totalTime += d.Resolution_Time;
      }
    });

    const formattedStats = Object.entries(stats).map(([shift, s]) => ({
      shift,
      resolutionRate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0,
      avgHandlingTime: s.resolved > 0 ? Math.round(s.totalTime / s.resolved) : 0
    }));

    return { chartData: formattedStats, shiftStats: formattedStats };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">Shift Efficiency Analytics</h3>
        <p className="text-sm text-gray-500 mt-1">Detailed breakdown of handling times and resolution rates across shifts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 flex-1">
        {/* Chart 1: Handling Time */}
        <div className="flex flex-col h-80 bg-gray-50/30 p-4 rounded-xl border border-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-6 text-center">Average Handling Time (Hours)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="shift" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} hrs`, 'Avg Time']}
              />
              <Bar dataKey="avgHandlingTime" name="Avg Time" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Resolution Rate */}
        <div className="flex flex-col h-80 bg-gray-50/30 p-4 rounded-xl border border-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-6 text-center">Resolution Rate (%)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="shift" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
              />
              <Area type="monotone" dataKey="resolutionRate" name="Resolution Rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
        {shiftStats.map((stat) => (
          <div key={stat.shift} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-bold text-gray-800 mb-3">{stat.shift} Shift</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Resolution Rate</span>
                <span className="text-sm font-bold text-gray-900 bg-emerald-50 px-2 py-0.5 rounded-md text-emerald-700">{stat.resolutionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Clock size={14} className="text-purple-500" /> Avg Handling Time</span>
                <span className="text-sm font-bold text-gray-900 bg-purple-50 px-2 py-0.5 rounded-md text-purple-700">{stat.avgHandlingTime}h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

