import React from 'react';
import { X, User, Activity, Clock, Calendar, AlertCircle, Stethoscope, Briefcase } from 'lucide-react';
import { PatientRecord } from '../types';
import { format, parseISO } from 'date-fns';
import { cn } from './KPICard';

interface PatientModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
              <p className="text-sm text-gray-500">{patient.Patient_ID}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase size={16} />
                <span>Department</span>
              </div>
              <p className="font-medium text-gray-900">{patient.Department}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Stethoscope size={16} />
                <span>Doctor</span>
              </div>
              <p className="font-medium text-gray-900">{patient.Doctor_Name}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Admission Date</span>
              </div>
              <p className="font-medium text-gray-900">
                {format(parseISO(patient.Admission_Date), 'MMM dd, yyyy')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Discharge Date</span>
              </div>
              <p className="font-medium text-gray-900">
                {patient.Discharge_Date ? format(parseISO(patient.Discharge_Date), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle size={16} />
                <span>Priority</span>
              </div>
              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", priorityColors[patient.Priority])}>
                {patient.Priority}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity size={16} />
                <span>Status</span>
              </div>
              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[patient.Status])}>
                {patient.Status}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Shift</span>
              </div>
              <p className="font-medium text-gray-900">{patient.Shift}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Resolution Time</span>
              </div>
              <p className="font-medium text-gray-900">
                {patient.Resolution_Time !== null ? `${Math.round(patient.Resolution_Time)} hours` : 'Pending'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
