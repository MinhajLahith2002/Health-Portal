export type Gender = "Male" | "Female" | "Other";

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  gender: Gender;
  dateOfBirth: string;
  address: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  rating: number;
  availableToday: boolean;
  bio?: string;
}

export type DoctorProfileUpdate = Omit<Doctor, "id" | "rating" | "availableToday">;
