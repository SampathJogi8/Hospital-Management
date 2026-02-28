import React from 'react';
import { FilterState, Department, Priority } from '../types';

interface FiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  departments: Department[];
  doctors: string[];
  priorities: Priority[];
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters, departments, doctors, priorities }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex flex-col flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-gray-500 mb-1">Department</label>
        <select 
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors"
          value={filters.department}
          onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value as Department | 'All' }))}
        >
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-gray-500 mb-1">Doctor</label>
        <select 
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors"
          value={filters.doctor}
          onChange={(e) => setFilters(prev => ({ ...prev, doctor: e.target.value }))}
        >
          <option value="All">All Doctors</option>
          {doctors.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col flex-1 min-w-[150px]">
        <label className="text-xs font-medium text-gray-500 mb-1">Priority</label>
        <select 
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-colors"
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as Priority | 'All' }))}
        >
          <option value="All">All Priorities</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      
      <div className="flex flex-col ml-auto">
        <button 
          onClick={() => setFilters({ dateRange: [null, null], department: 'All', doctor: 'All', priority: 'All' })}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors mt-5"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
