import api from "@/lib/axios";

export interface PatientProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  provider?: string;
  googleId?: string;
  picture?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePatientProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export const patientService = {
  async getProfile(): Promise<PatientProfile> {
    return await api.get<PatientProfile>("/users/profile");
  },

  async updateProfile(payload: UpdatePatientProfilePayload): Promise<PatientProfile> {
    return await api.put<PatientProfile>("/users/profile", payload);
  },
};
