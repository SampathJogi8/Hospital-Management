import { PatientRecord, FilterState } from '../types';
import { isWithinInterval, parseISO } from 'date-fns';

export const filterData = (data: PatientRecord[], filters: FilterState): PatientRecord[] => {
  return data.filter(record => {
    // Date Range Filter
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const admissionDate = parseISO(record.Admission_Date);
      if (!isWithinInterval(admissionDate, { start: filters.dateRange[0], end: filters.dateRange[1] })) {
        return false;
      }
    }

    // Department Filter
    if (filters.department !== 'All' && record.Department !== filters.department) {
      return false;
    }

    // Doctor Filter
    if (filters.doctor !== 'All' && record.Doctor_Name !== filters.doctor) {
      return false;
    }

    // Priority Filter
    if (filters.priority !== 'All' && record.Priority !== filters.priority) {
      return false;
    }

    return true;
  });
};

export const computeMetrics = (data: PatientRecord[]) => {
  const totalPatients = data.length;
  const activeCases = data.filter(d => d.Status === 'Admitted' || d.Status === 'In Treatment').length;
  
  const resolvedCases = data.filter(d => d.Resolution_Time !== null);
  const avgResolutionTime = resolvedCases.length > 0 
    ? resolvedCases.reduce((acc, curr) => acc + (curr.Resolution_Time || 0), 0) / resolvedCases.length 
    : 0;
    
  // Mock bed occupancy (assuming 230 beds total)
  const totalBeds = 230;
  const bedOccupancy = Math.min(100, Math.round((activeCases / totalBeds) * 100));

  const todayStr = new Date().toISOString().split('T')[0];

  const emergencyCasesToday = data.filter(d => {
    return d.Department === 'Emergency' && d.Admission_Date.startsWith(todayStr);
  }).length;

  // Mock staff on duty (unique doctors in active cases)
  const staffOnDuty = new Set(data.filter(d => d.Status === 'Admitted' || d.Status === 'In Treatment').map(d => d.Doctor_Name)).size;

  const totalRevenue = data.reduce((acc, curr) => acc + (curr.Revenue || 0), 0);
  
  const dischargesToday = data.filter(d => d.Discharge_Date && d.Discharge_Date.startsWith(todayStr)).length;

  return {
    totalPatients,
    activeCases,
    avgResolutionTime: Math.round(avgResolutionTime),
    bedOccupancy,
    emergencyCasesToday,
    staffOnDuty,
    totalRevenue,
    dischargesToday
  };
};
