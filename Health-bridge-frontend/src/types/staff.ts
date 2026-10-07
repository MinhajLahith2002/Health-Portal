export type DutyStatus = 'On Duty' | 'Off Duty' | 'Emergency Cover' | 'On Break' | 'On Leave';

export interface StaffMember {
  id: string; // e.g. "HB-4921"
  firstName: string;
  lastName: string;
  role: string; // e.g. "Senior RN - ICU", "Attending - Cardiology", "Chief of Surgery"
  department: string; // e.g. "ICU", "Cardiology", "Radiology", "Emergency", "Pediatrics"
  email: string;
  phone: string;
  extension?: string;
  dutyStatus: DutyStatus;
  currentShift: string; // e.g. "08:00 - 16:00", "Next: 18:00 (Tomorrow)"
  avatarUrl?: string;
  initials?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  nationalId?: string;
  residentialAddress?: string;
  hireDate?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  locationFloor?: string;
  accountStatus?: 'Active' | 'Suspended';
  branchId?: string;
  branchCode?: string;
}

export interface StaffOverviewStats {
  totalActiveStaff: number;
  newThisMonth: number;
  onDutyCount: number;
  openShiftAlerts: number;
  pendingLeaveRequests: number;
}
