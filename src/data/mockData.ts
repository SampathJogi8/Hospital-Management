import { PatientRecord, Department, Priority, Status, Shift } from '../types';
import { addDays, subDays } from 'date-fns';

const departments: Department[] = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'General Surgery'];
const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const statuses: Status[] = ['Admitted', 'Discharged', 'Transferred', 'In Treatment'];
const shifts: Shift[] = ['Morning', 'Afternoon', 'Night'];
const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Reddy', 'Dr. Iyer', 'Dr. Singh', 'Dr. Gupta', 'Dr. Desai', 'Dr. Joshi', 'Dr. Kumar', 'Dr. Verma'];

export const generateMockData = (count: number): PatientRecord[] => {
  const data: PatientRecord[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    
    // Admission date between 30 days ago and today
    const daysAgo = Math.floor(Math.random() * 30);
    const admissionDate = subDays(today, daysAgo);
    
    let dischargeDate = null;
    let resolutionTime = null;

    if (status === 'Discharged' || status === 'Transferred') {
      const daysInHospital = Math.floor(Math.random() * 10) + 1;
      dischargeDate = addDays(admissionDate, daysInHospital);
      // If discharge date is in the future, cap it to today
      if (dischargeDate > today) {
         dischargeDate = today;
      }
      resolutionTime = (dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60); // hours
    }

    // Generate random revenue based on priority and department
    let baseRevenue = 15000; // Base INR
    if (priority === 'Critical') baseRevenue += 50000;
    else if (priority === 'High') baseRevenue += 25000;
    
    if (department === 'Cardiology' || department === 'Oncology') baseRevenue += 30000;
    else if (department === 'Neurology' || department === 'Orthopedics') baseRevenue += 20000;

    const revenue = baseRevenue + Math.floor(Math.random() * 10000);

    data.push({
      Patient_ID: `PT-${1000 + i}`,
      Department: department,
      Doctor_Name: doctor,
      Admission_Date: admissionDate.toISOString(),
      Discharge_Date: dischargeDate ? dischargeDate.toISOString() : null,
      Priority: priority,
      Status: status,
      Shift: shift,
      Resolution_Time: resolutionTime,
      Revenue: revenue,
    });
  }
  
  // Sort by admission date
  return data.sort((a, b) => new Date(a.Admission_Date).getTime() - new Date(b.Admission_Date).getTime());
};

export const mockData = generateMockData(500);
