export type BedStatus = 'Available' | 'Reserved' | 'Occupied' | 'Maintenance' | 'Cleaning';

export type WardType = string;

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  assignedDoctor: string;
  admissionDate?: string;
  expDischarge?: string;
  admissionNotes?: string;
  eta?: string;
  currentWard?: string;
  currentBedId?: string;
}

export interface Bed {
  id: string; // e.g. "ICU-101"
  bedId?: string;
  code: string; // e.g. "101"
  ward: WardType;
  status: BedStatus;
  bedType?: string; // e.g. "ICU Standard", "Electric", "Isolation"
  patient?: PatientInfo;
  branchId?: string;
  branchCode?: string;
}

export interface BedOverviewStats {
  totalBeds: number;
  occupiedBeds: number;
  occupiedPercentage: number;
  availableBeds: number;
  maintenanceBeds: number;
  cleaningBeds: number;
}

export interface DepartmentOccupancy {
  department: WardType;
  occupancyPercentage: number;
  isAlert?: boolean;
}
