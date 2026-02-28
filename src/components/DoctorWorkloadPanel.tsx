import React, { useMemo } from 'react';
import { PatientRecord } from '../types';
import { Users, Clock, Activity, AlertCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const DoctorWorkloadPanel: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const doctorStats = useMemo(() => {
    const stats: Record<string, { 
      activeCases: number, 
      dailyCases: number,
      weeklyCases: number, 
      totalResolutionTime: number, 
      resolvedCases: number 
    }> = {};

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    data.forEach(d => {
      if (!stats[d.Doctor_Name]) {
        stats[d.Doctor_Name] = { activeCases: 0, dailyCases: 0, weeklyCases: 0, totalResolutionTime: 0, resolvedCases: 0 };
      }

      if (d.Status === 'Admitted' || d.Status === 'In Treatment') {
        stats[d.Doctor_Name].activeCases += 1;
      }

      const admissionDate = new Date(d.Admission_Date);
      if (admissionDate >= oneWeekAgo) {
        stats[d.Doctor_Name].weeklyCases += 1;
      }
      
      if (d.Admission_Date.startsWith(todayStr)) {
        stats[d.Doctor_Name].dailyCases += 1;
      }

      if (d.Resolution_Time !== null) {
        stats[d.Doctor_Name].totalResolutionTime += d.Resolution_Time;
        stats[d.Doctor_Name].resolvedCases += 1;
      }
    });

    const processedStats = Object.entries(stats).map(([name, s]) => {
      const avgConsultationTime = s.resolvedCases > 0 ? s.totalResolutionTime / s.resolvedCases : 0;
      
      let status: 'Overloaded' | 'Optimal' | 'Underutilized' = 'Optimal';

      if (s.activeCases > 18) {
        status = 'Overloaded';
      } else if (s.activeCases < 12) {
        status = 'Underutilized';
      }

      return {
        name,
        ...s,
        avgConsultationTime,
        status,
        suggestion: '' // Will be filled in next pass
      };
    }).sort((a, b) => b.activeCases - a.activeCases);

    // Generate smart suggestions based on overall team state
    const underutilizedDoctors = processedStats.filter(d => d.status === 'Underutilized');
    
    processedStats.forEach(doc => {
      if (doc.status === 'Overloaded') {
        const excess = Math.round(((doc.activeCases - 18) / 18) * 100);
        if (underutilizedDoctors.length > 0) {
          const target = underutilizedDoctors[0].name;
          doc.suggestion = `${doc.name} exceeds optimal capacity by ${excess}%. Suggest reassigning new cases to ${target}.`;
        } else {
          doc.suggestion = `${doc.name} exceeds optimal capacity by ${excess}%. No underutilized doctors available. Pause new admissions.`;
        }
      } else if (doc.status === 'Underutilized') {
        doc.suggestion = `${doc.name} has available capacity. Route new admissions here.`;
      } else {
        doc.suggestion = 'Workload is balanced. Maintain current assignment rate.';
      }
    });

    return processedStats;
  }, [data]);

  const getStatusColor = (status: string) => {
    if (status === 'Overloaded') return '#ef4444'; // red-500
    if (status === 'Underutilized') return '#10b981'; // emerald-500
    return '#3b82f6'; // blue-500
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Doctor-Level Workload Analysis</h3>
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Users size={20} />
        </div>
      </div>
      
      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-center gap-6 mb-6 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Overloaded</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Optimal</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Underutilized</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctorStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickMargin={10} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="dailyCases" name="Daily Cases" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {doctorStats.map((entry, index) => (
                  <Cell key={`cell-daily-${index}`} fill={getStatusColor(entry.status)} fillOpacity={0.5} />
                ))}
              </Bar>
              <Bar dataKey="weeklyCases" name="Weekly Cases" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {doctorStats.map((entry, index) => (
                  <Cell key={`cell-weekly-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-6 space-y-6 max-h-[400px]">
        {doctorStats.map((doc, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Activity size={14} /> {doc.activeCases} Active</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {doc.dailyCases} Today</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {doc.weeklyCases} Weekly</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {Math.round(doc.avgConsultationTime)}h Avg Time</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                doc.status === 'Overloaded' ? 'bg-red-100 text-red-800' :
                doc.status === 'Underutilized' ? 'bg-emerald-100 text-emerald-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {doc.status}
              </span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-start gap-2">
              <AlertCircle size={16} className={`shrink-0 mt-0.5 ${
                doc.status === 'Overloaded' ? 'text-red-500' :
                doc.status === 'Underutilized' ? 'text-emerald-500' :
                'text-blue-500'
              }`} />
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">AI Suggestion:</span> {doc.suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
