import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { format, parseISO } from 'date-fns';
import { cn } from './KPICard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface PatientTableProps {
  data: PatientRecord[];
  onRowClick: (patient: PatientRecord) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({ data, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const priorityColors = {
    'Low': 'bg-emerald-100 text-emerald-800',
    'Medium': 'bg-amber-100 text-amber-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'Admitted': 'bg-blue-100 text-blue-800',
    'Discharged': 'bg-gray-100 text-gray-800',
    'Transferred': 'bg-purple-100 text-purple-800',
    'In Treatment': 'bg-indigo-100 text-indigo-800'
  };

  const filteredData = data.filter(patient => 
    patient.Patient_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.Doctor_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.Department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Patient Directory</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Patient ID</th>
              <th scope="col" className="px-6 py-4 font-medium">Department</th>
              <th scope="col" className="px-6 py-4 font-medium">Doctor</th>
              <th scope="col" className="px-6 py-4 font-medium">Admission Date</th>
              <th scope="col" className="px-6 py-4 font-medium">Priority</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((patient) => (
                <tr 
                  key={patient.Patient_ID} 
                  onClick={() => onRowClick(patient)}
                  className="bg-white border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{patient.Patient_ID}</td>
                  <td className="px-6 py-4">{patient.Department}</td>
                  <td className="px-6 py-4">{patient.Doctor_Name}</td>
                  <td className="px-6 py-4">{format(parseISO(patient.Admission_Date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", priorityColors[patient.Priority])}>
                      {patient.Priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[patient.Status])}>
                      {patient.Status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No patients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-gray-900">{filteredData.length}</span> entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
