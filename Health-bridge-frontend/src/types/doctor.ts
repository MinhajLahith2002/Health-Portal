export type DoctorGender = "Male" | "Female" | "Other";

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialization?: string;
  gender?: DoctorGender;
  availableToday?: boolean;
  rating?: number;
  consultationFee?: number;
  profileImage?: string;
}

export interface DoctorProfileUpdate {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  gender?: DoctorGender;
}
