import { apiClient } from "./apiClient";

export interface PatientSummary {
  id: string;
  patientId?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role?: string;
  age?: number;
  gender?: string;
}

export const patientService = {
  getAllPatients: async (): Promise<PatientSummary[]> => {
    try {
      const data = await apiClient.get<PatientSummary[]>("/users?role=PATIENT");
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      if (status === 404 || status === 500) {
        console.warn("⚠️ Patient API not available, using fallback data");
        return getFallbackPatients();
      }
      
      console.error("❌ Failed to load patients:", error);
      return getFallbackPatients();
    }
  },

  searchPatients: async (query: string): Promise<PatientSummary[]> => {
    try {
      const all = await patientService.getAllPatients();
      if (!query) return all;
      const lower = query.toLowerCase();
      return all.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(lower) ||
          p.id?.toLowerCase().includes(lower) ||
          p.email?.toLowerCase().includes(lower)
      );
    } catch (error) {
      return [];
    }
  },

  getPatientById: async (id: string): Promise<PatientSummary | null> => {
    try {
      return await apiClient.get<PatientSummary>(`/users/${id}`);
    } catch (error) {
      return null;
    }
  },
};

// ✅ Fallback data
const getFallbackPatients = (): PatientSummary[] => [
  { id: "PAT-001", fullName: "John Doe", email: "john.doe@email.com", phoneNumber: "+94-77-1234567", role: "PATIENT" },
  { id: "PAT-002", fullName: "Jane Smith", email: "jane.smith@email.com", phoneNumber: "+94-71-2345678", role: "PATIENT" },
  { id: "PAT-003", fullName: "Robert Johnson", email: "robert.j@email.com", phoneNumber: "+94-72-3456789", role: "PATIENT" },
  { id: "PAT-004", fullName: "Mary Wilson", email: "mary.w@email.com", phoneNumber: "+94-76-4567890", role: "PATIENT" },
  { id: "PAT-005", fullName: "David Brown", email: "david.b@email.com", phoneNumber: "+94-78-5678901", role: "PATIENT" },
];