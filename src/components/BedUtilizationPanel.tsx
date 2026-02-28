import React, { useMemo } from 'react';
import { PatientRecord } from '../types';
import { Bed, Activity, Clock, RefreshCcw } from 'lucide-react';

export const BedUtilizationPanel: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const stats = useMemo(() => {
    const capacities = {
      ICU: 30,
      General: 120,
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

    const turnoverRate = resolvedCases.length / 200; // Total beds

    return { occupancy, avgLengthOfStay, turnoverRate };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Bed Utilization Breakdown</h3>
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Bed size={20} />
        </div>
      </div>
      
      <div className="p-6 space-y-6 flex-1">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">ICU Occupancy</span>
              <span className="font-semibold text-gray-900">{stats.occupancy.ICU}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.ICU > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${stats.occupancy.ICU}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">General Ward Occupancy</span>
              <span className="font-semibold text-gray-900">{stats.occupancy.General}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.General > 85 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${stats.occupancy.General}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Emergency Occupancy</span>
              <span className="font-semibold text-gray-900">{stats.occupancy.Emergency}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${stats.occupancy.Emergency > 85 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${stats.occupancy.Emergency}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
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
