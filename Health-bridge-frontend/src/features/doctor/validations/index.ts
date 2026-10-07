import type { AvailabilityInput, DoctorProfileUpdate, LeaveInput } from "../types";

export function validateProfile(data: DoctorProfileUpdate) {
  if (!data.fullName.trim() || !data.email.trim() || !data.specialization.trim()) return "Name, email, and specialization are required.";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Enter a valid email address.";
  if (data.experience < 0 || data.consultationFee < 0) return "Experience and consultation fee cannot be negative.";
  return "";
}

export function validateAvailability(data: AvailabilityInput) {
  if (!data.date || !data.startTime || !data.endTime) return "Date, start time, and end time are required.";
  if (data.startTime >= data.endTime) return "End time must be later than start time.";
  return "";
}

export function validateLeave(data: LeaveInput) {
  if (!data.startDate || !data.endDate || !data.reason.trim()) return "Complete all leave fields.";
  if (data.endDate < data.startDate) return "End date cannot be before start date.";
  return "";
}
