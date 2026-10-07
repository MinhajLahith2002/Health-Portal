import { apiClient } from "./apiClient";

export interface DoctorSummary {
  id: string;
  doctorId?: string;
  fullName: string;
  name?: string;
  specialization?: string;
  email?: string;
  phone?: string;
  hospitalId?: string;
}

export const doctorService = {
  getAllDoctors: async (): Promise<DoctorSummary[]> => {
    try {
      return await apiClient.get<DoctorSummary[]>("/doctors");
    } catch (error) {
      console.warn("Doctor API not found");
      return [];
    }
  },

  searchDoctors: async (query: string): Promise<DoctorSummary[]> => {
    try {
      const all = await doctorService.getAllDoctors();
      if (!query) return all;
      const lower = query.toLowerCase();
      return all.filter(
        (d) =>
          (d.fullName || d.name)?.toLowerCase().includes(lower) ||
          d.specialization?.toLowerCase().includes(lower) ||
          d.id?.toLowerCase().includes(lower)
      );
    } catch (error) {
      return [];
    }
  },

  getDoctorById: async (id: string): Promise<DoctorSummary | null> => {
    try {
      return await apiClient.get<DoctorSummary>(`/doctors/${id}`);
    } catch (error) {
      return null;
    }
  },
};