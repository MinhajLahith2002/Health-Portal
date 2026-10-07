export type LeaveType = "Annual" | "Sick" | "Emergency" | "Other";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface DoctorLeave {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
}

export type LeaveInput = Pick<DoctorLeave, "leaveType" | "startDate" | "endDate" | "reason">;
