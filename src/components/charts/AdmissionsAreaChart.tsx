import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PatientRecord } from '../../types';
import { format, parseISO } from 'date-fns';

export const AdmissionsAreaChart: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    const dates: Record<string, { admissions: number, discharges: number }> = {};
    
    data.forEach(d => {
      const admissionDate = format(parseISO(d.Admission_Date), 'MMM dd');
      if (!dates[admissionDate]) dates[admissionDate] = { admissions: 0, discharges: 0 };
      dates[admissionDate].admissions += 1;

      if (d.Discharge_Date) {
        const dischargeDate = format(parseISO(d.Discharge_Date), 'MMM dd');
        if (!dates[dischargeDate]) dates[dischargeDate] = { admissions: 0, discharges: 0 };
        dates[dischargeDate].discharges += 1;
      }
    });

    return Object.entries(dates)
      .map(([date, counts]) => ({ date, ...counts }))
      // Sort by date string (simplified, assumes same year for mock data)
      .sort((a, b) => new Date(`2024 ${a.date}`).getTime() - new Date(`2024 ${b.date}`).getTime())
      .slice(-14); // Last 14 days
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Admissions vs Discharges (Last 14 Days)</h3>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDischarges" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={20} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="admissions" name="Admissions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAdmissions)" />
            <Area type="monotone" dataKey="discharges" name="Discharges" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDischarges)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
