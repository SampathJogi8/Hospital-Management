import React, { useMemo } from 'react';
import { PatientRecord } from '../types';
import { Bed, Activity, Clock, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const BedUtilizationPanel: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const stats = useMemo(() => {
    const capacities = {
      ICU: 30,
      General: 150,
      Emergency: 50
    };

    const activeCases = {
      ICU: data.filter(d => (d.Status === 'Admitted' || d.Status === 'In Treatment') && d.Priority === 'Critical').length,
      Emergency: data.filter(d => (d.Status === 'Admitted' || d.Status === 'In Treatment') && d.Department === 'Emergency').length,
      General: data.filter(d => (d.Status === 'Admitted' || d.Status === 'In Treatment') && d.Priority !== 'Critical' && d.Department !== 'Emergency').length
    };

    const occupancy = {
      ICU: Math.min(100, Math.round((activeCases.ICU / capacities.ICU) * 100)),
      General: Math.min(100, Math.round((activeCases.General / capacities.General) * 100)),
      Emergency: Math.min(100, Math.round((activeCases.Emergency / capacities.Emergency) * 100))
    };

    const resolvedCases = data.filter(d => d.Resolution_Time !== null);
    const avgLengthOfStay = resolvedCases.length > 0 
      ? resolvedCases.reduce((acc, curr) => acc + (curr.Resolution_Time || 0), 0) / resolvedCases.length / 24 // in days
      : 0;

    const turnoverRate = resolvedCases.length / 230; // Total beds

    const chartData = [
      { 
        name: 'ICU', 
        Occupied: Math.min(activeCases.ICU, capacities.ICU), 
        Available: Math.max(0, capacities.ICU - activeCases.ICU),
        total: capacities.ICU
      },
      { 
        name: 'General', 
        Occupied: Math.min(activeCases.General, capacities.General), 
        Available: Math.max(0, capacities.General - activeCases.General),
        total: capacities.General
      },
      { 
        name: 'Emergency', 
        Occupied: Math.min(activeCases.Emergency, capacities.Emergency), 
        Available: Math.max(0, capacities.Emergency - activeCases.Emergency),
        total: capacities.Emergency
      }
    ];

    return { occupancy, activeCases, capacities, avgLengthOfStay, turnoverRate, chartData };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Bed Utilization Breakdown</h3>
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Bed size={20} />
        </div>
      </div>
      
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">ICU Occupancy</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.occupancy.ICU}%</span>
                <span className="text-xs text-gray-500 ml-2">({stats.activeCases.ICU} / {stats.capacities.ICU} Beds)</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.ICU > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${stats.occupancy.ICU}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">General Ward Occupancy</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.occupancy.General}%</span>
                <span className="text-xs text-gray-500 ml-2">({stats.activeCases.General} / {stats.capacities.General} Beds)</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.General > 85 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${stats.occupancy.General}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Emergency Occupancy</span>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.occupancy.Emergency}%</span>
                <span className="text-xs text-gray-500 ml-2">({stats.activeCases.Emergency} / {stats.capacities.Emergency} Beds)</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.Emergency > 85 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${stats.occupancy.Emergency}%` }}></div>
            </div>
          </div>
        </div>

        <div className="h-48 w-full mt-6 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Capacity Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={70} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              <Bar dataKey="Occupied" stackId="a" fill="#3b82f6" radius={[4, 0, 0, 4]} maxBarSize={20} />
              <Bar dataKey="Available" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <RefreshCcw size={16} />
              <span className="text-sm font-medium">Turnover Rate</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.turnoverRate.toFixed(1)} <span className="text-sm font-normal text-gray-500">pts/bed</span></p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={16} />
              <span className="text-sm font-medium">Avg Length of Stay</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.avgLengthOfStay.toFixed(1)} <span className="text-sm font-normal text-gray-500">days</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
