import { PatientRecord, Department, Priority, Status, Shift } from '../types';
import { addDays, subDays } from 'date-fns';

const departments: Department[] = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'General Surgery'];
const deptWeights = [15, 10, 15, 15, 15, 10, 20];

const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const priorityWeights = [30, 40, 20, 10];

const statuses: Status[] = ['Admitted', 'In Treatment', 'Discharged', 'Transferred'];
const statusWeights = [5, 15, 70, 10]; // ~20% active cases

const shifts: Shift[] = ['Morning', 'Afternoon', 'Night'];
const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Reddy', 'Dr. Iyer', 'Dr. Singh', 'Dr. Gupta', 'Dr. Desai', 'Dr. Joshi', 'Dr. Kumar', 'Dr. Verma'];

const doctorDeptMap: Record<string, string[]> = {
  'Cardiology': ['Dr. Sharma', 'Dr. Patel'],
  'Neurology': ['Dr. Reddy'],
  'Orthopedics': ['Dr. Iyer', 'Dr. Singh'],
  'Pediatrics': ['Dr. Gupta'],
  'Emergency': ['Dr. Desai', 'Dr. Joshi'],
  'Oncology': ['Dr. Kumar'],
  'General Surgery': ['Dr. Verma', 'Dr. Sharma'] // Dr. Sharma does both
};

function getWeightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

export const generateMockData = (count: number): PatientRecord[] => {
  const data: PatientRecord[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const department = getWeightedRandom(departments, deptWeights);
    
    let currentPriorityWeights = priorityWeights;
    if (department === 'Emergency') {
      currentPriorityWeights = [10, 20, 40, 30];
    } else if (department === 'Oncology') {
      currentPriorityWeights = [10, 30, 40, 20];
    }

    const priority = getWeightedRandom(priorities, currentPriorityWeights);
    const status = getWeightedRandom(statuses, statusWeights);
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    
    const possibleDoctors = doctorDeptMap[department] || doctors;
    const doctor = possibleDoctors[Math.floor(Math.random() * possibleDoctors.length)];
    
    let daysAgo = Math.floor(Math.random() * 30);
    if (status === 'Admitted') {
      daysAgo = Math.floor(Math.random() * 3); // 0-2 days ago
    } else if (status === 'In Treatment') {
      daysAgo = Math.floor(Math.random() * 10) + 1; // 1-10 days ago
    } else {
      daysAgo = Math.floor(Math.random() * 20) + 5; // 5-25 days ago
    }
    
    const admissionDate = subDays(today, daysAgo);
    
    let dischargeDate = null;
    let resolutionTime = null;

    if (status === 'Discharged' || status === 'Transferred') {
      let maxDays = 5;
      if (priority === 'Critical') maxDays = 15;
      else if (priority === 'High') maxDays = 10;
      else if (priority === 'Medium') maxDays = 7;
      
      const daysInHospital = Math.floor(Math.random() * maxDays) + 1;
      dischargeDate = addDays(admissionDate, daysInHospital);
      
      if (dischargeDate > today) {
         dischargeDate = today;
      }
      resolutionTime = (dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60); // hours
    }

    let baseRevenue = 15000;
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
  
  return data.sort((a, b) => new Date(a.Admission_Date).getTime() - new Date(b.Admission_Date).getTime());
};

export const mockData = generateMockData(800);
