export type Department = 'Cardiology' | 'Neurology' | 'Orthopedics' | 'Pediatrics' | 'Emergency' | 'Oncology' | 'General Surgery';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Admitted' | 'Discharged' | 'Transferred' | 'In Treatment';
export type Shift = 'Morning' | 'Afternoon' | 'Night';

export interface PatientRecord {
  Patient_ID: string;
  Department: Department;
  Doctor_Name: string;
  Admission_Date: string; // ISO string
  Discharge_Date: string | null; // ISO string
  Priority: Priority;
  Status: Status;
  Shift: Shift;
  Resolution_Time: number | null; // in hours
  Revenue: number; // in INR
}

export interface FilterState {
  dateRange: [Date | null, Date | null];
  department: Department | 'All';
  doctor: string | 'All';
  priority: Priority | 'All';
}

