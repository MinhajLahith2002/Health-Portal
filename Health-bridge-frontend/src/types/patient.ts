export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface PatientProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}
