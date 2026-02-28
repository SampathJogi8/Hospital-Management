import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Activity, Users } from 'lucide-react';
import { PatientRecord } from '../types';

export const SmartAlerts: React.FC<{ data: PatientRecord[] }> = ({ data }) => {
  const alerts = useMemo(() => {
    const newAlerts = [];
    const activeCases = data.filter(d => d.Status === 'Admitted' || d.Status === 'In Treatment');
    
    // Bed occupancy > 90%
    const totalBeds = 230;
    const occupancy = (activeCases.length / totalBeds) * 100;
    if (occupancy > 90) {
      newAlerts.push({
        id: 'bed-occupancy',
        type: 'critical',
        icon: AlertTriangle,
        title: 'Critical Bed Occupancy',
        message: `Current bed occupancy is at ${occupancy.toFixed(1)}%. Immediate action required.`
      });
    }

    // Emergency spike detection
    const today = new Date().toISOString().split('T')[0];
    const emergencyToday = data.filter(d => d.Department === 'Emergency' && d.Admission_Date.startsWith(today)).length;
    if (emergencyToday > 25) { // Threshold for mock data
      newAlerts.push({
        id: 'emergency-spike',
        type: 'warning',
        icon: TrendingUp,
        title: 'Emergency Admission Spike',
        message: `Unusual spike detected: ${emergencyToday} emergency cases admitted today.`
      });
    }

    // Doctors crossing safe workload
    const doctorWorkload: Record<string, number> = {};
    activeCases.forEach(d => {
      doctorWorkload[d.Doctor_Name] = (doctorWorkload[d.Doctor_Name] || 0) + 1;
    });
    const overloadedDoctors = Object.entries(doctorWorkload).filter(([_, count]) => count > 18); // Threshold
    if (overloadedDoctors.length > 0) {
      newAlerts.push({
        id: 'doctor-workload',
        type: 'warning',
        icon: Users,
        title: 'High Doctor Workload',
        message: `${overloadedDoctors.length} doctors are currently exceeding safe active case thresholds.`
      });
    }

    // Departments exceeding capacity
    const deptWorkload: Record<string, number> = {};
    activeCases.forEach(d => {
      deptWorkload[d.Department] = (deptWorkload[d.Department] || 0) + 1;
    });
    const overloadedDepts = Object.entries(deptWorkload).filter(([_, count]) => count > 45); // Threshold
    if (overloadedDepts.length > 0) {
      newAlerts.push({
        id: 'dept-capacity',
        type: 'warning',
        icon: Activity,
        title: 'Department Capacity Alert',
        message: `${overloadedDepts.map(d => d[0]).join(', ')} operating above optimal capacity.`
      });
    }

    return newAlerts;
  }, [data]);

  if (alerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`flex items-start gap-3 p-4 rounded-2xl border ${
            alert.type === 'critical' 
              ? 'bg-red-50 border-red-100 text-red-900' 
              : 'bg-amber-50 border-amber-100 text-amber-900'
          }`}
        >
          <div className={`p-2 rounded-full ${
            alert.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <alert.icon size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
