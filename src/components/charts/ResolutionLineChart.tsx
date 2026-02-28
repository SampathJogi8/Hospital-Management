import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PatientRecord } from '../../types';
import { format, parseISO, subDays } from 'date-fns';
import { AlertCircle, TrendingUp, BarChart2, LineChart as LineChartIcon } from 'lucide-react';

export const ResolutionLineChart: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'trend' | 'department'>('trend');

  const { chartData, deptData, agingStats, backlogWarning } = useMemo(() => {
    const dates: Record<string, { 
      totalTime: number, count: number, 
      criticalTime: number, criticalCount: number,
      nonCriticalTime: number, nonCriticalCount: number 
    }> = {};
    
    const depts: Record<string, { totalTime: number, count: number }> = {};

    data.forEach(d => {
      if (d.Resolution_Time !== null && d.Discharge_Date) {
        // Trend Data
        const date = format(parseISO(d.Discharge_Date), 'MMM dd');
        if (!dates[date]) dates[date] = { totalTime: 0, count: 0, criticalTime: 0, criticalCount: 0, nonCriticalTime: 0, nonCriticalCount: 0 };
        
        dates[date].totalTime += d.Resolution_Time;
        dates[date].count += 1;

        if (d.Priority === 'Critical') {
          dates[date].criticalTime += d.Resolution_Time;
          dates[date].criticalCount += 1;
        } else {
          dates[date].nonCriticalTime += d.Resolution_Time;
          dates[date].nonCriticalCount += 1;
        }

        // Department Data
        if (!depts[d.Department]) depts[d.Department] = { totalTime: 0, count: 0 };
        depts[d.Department].totalTime += d.Resolution_Time;
        depts[d.Department].count += 1;
      }
    });

    let rawData = Object.entries(dates)
      .map(([date, stats]) => ({ 
        date, 
        avgTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0,
        criticalAvg: stats.criticalCount > 0 ? Math.round(stats.criticalTime / stats.criticalCount) : 0,
        nonCriticalAvg: stats.nonCriticalCount > 0 ? Math.round(stats.nonCriticalTime / stats.nonCriticalCount) : 0,
      }))
      .sort((a, b) => new Date(`2024 ${a.date}`).getTime() - new Date(`2024 ${b.date}`).getTime());

    // Calculate 7-day moving average
    const smoothedData = rawData.map((day, index, arr) => {
      const startIdx = Math.max(0, index - 6);
      const window = arr.slice(startIdx, index + 1);
      const movingAvg = Math.round(window.reduce((acc, curr) => acc + curr.avgTime, 0) / window.length);
      return { ...day, movingAvg };
    }).slice(-14);

    // Department Comparison Data
    const deptComparisonData = Object.entries(depts)
      .map(([department, stats]) => ({
        department,
        avgTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0
      }))
      .sort((a, b) => b.avgTime - a.avgTime);

    // Case aging analysis
    const now = new Date();
    const activeCases = data.filter(d => d.Status === 'Admitted' || d.Status === 'In Treatment');
    const agingStats = {
      '>24h': 0,
      '>48h': 0,
      '>72h': 0
    };

    activeCases.forEach(d => {
      const admissionDate = new Date(d.Admission_Date);
      const diffHours = (now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 72) agingStats['>72h']++;
      else if (diffHours > 48) agingStats['>48h']++;
      else if (diffHours > 24) agingStats['>24h']++;
    });

    // Predictive Trend & Backlog Warning
    const recentTrend = smoothedData.slice(-3);
    const isRising = recentTrend.length === 3 && recentTrend[2].movingAvg > recentTrend[0].movingAvg;
    const backlogWarning = isRising && agingStats['>72h'] > 10;

    return { chartData: smoothedData, deptData: deptComparisonData, agingStats, backlogWarning };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Resolution Trends & Efficiency</h3>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === 'trend' ? '7-day moving average with priority breakdown' : 'Average resolution time by department'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {backlogWarning && viewMode === 'trend' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm font-medium">
              <TrendingUp size={16} />
              Rising Backlog
            </div>
          )}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('trend')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'trend' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Trend View"
            >
              <LineChartIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('department')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'department' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Department Comparison"
            >
              <BarChart2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'trend' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => [`${value} hrs`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="movingAvg" name="7-Day Moving Avg" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="criticalAvg" name="Critical Avg" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="nonCriticalAvg" name="Non-Critical Avg" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          ) : (
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} angle={-45} textAnchor="end" height={60} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value} hrs`, 'Avg Time']}
              />
              <Bar dataKey="avgTime" name="Avg Time (hrs)" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
          <p className="text-xs font-medium text-amber-800 mb-1 flex items-center gap-1"><AlertCircle size={12} /> Pending &gt;24h</p>
          <p className="text-xl font-semibold text-amber-900">{agingStats['>24h']}</p>
        </div>
        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
          <p className="text-xs font-medium text-orange-800 mb-1 flex items-center gap-1"><AlertCircle size={12} /> Pending &gt;48h</p>
          <p className="text-xl font-semibold text-orange-900">{agingStats['>48h']}</p>
        </div>
        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
          <p className="text-xs font-medium text-red-800 mb-1 flex items-center gap-1"><AlertCircle size={12} /> Pending &gt;72h</p>
          <p className="text-xl font-semibold text-red-900">{agingStats['>72h']}</p>
        </div>
      </div>
    </div>
  );
};

