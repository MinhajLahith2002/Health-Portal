import { apiClient } from "./apiClient";

export interface HospitalSummary {
  id: string;
  hospitalId?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
}

export const hospitalService = {
  // ✅ Get all hospitals (with fallback)
  getAllHospitals: async (): Promise<HospitalSummary[]> => {
    try {
      console.log('📥 Fetching hospitals from API...');
      const data = await apiClient.get<HospitalSummary[]>("/hospitals");
      
      // ✅ Validate response is array
      if (!Array.isArray(data)) {
        console.warn("⚠️ Invalid hospital data format, using fallback");
        return getFallbackHospitals();
      }
      
      if (data.length === 0) {
        console.warn("⚠️ No hospitals in database, using fallback");
        return getFallbackHospitals();
      }
      
      console.log(`✅ Loaded ${data.length} hospitals from API`);
      return data;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      
      // ✅ Silent fallback for 404/500
      if (status === 404) {
        console.warn("⚠️ Hospital endpoint not found, using fallback data");
      } else if (status === 500) {
        console.warn("⚠️ Hospital API error, using fallback data");
      } else {
        console.error("❌ Failed to load hospitals:", error);
      }
      
      return getFallbackHospitals();
    }
  },

  // ✅ Search hospitals
  searchHospitals: async (query: string): Promise<HospitalSummary[]> => {
    try {
      const all = await hospitalService.getAllHospitals();
      if (!query.trim()) return all;
      
      const lower = query.toLowerCase();
      return all.filter(
        (h) =>
          h.name?.toLowerCase().includes(lower) ||
          h.id?.toLowerCase().includes(lower)
      );
    } catch (error) {
      console.error("Search hospitals failed:", error);
      return [];
    }
  },

  // ✅ Get hospital by ID
  getHospitalById: async (id: string): Promise<HospitalSummary | null> => {
    try {
      return await apiClient.get<HospitalSummary>(`/hospitals/${id}`);
    } catch (error) {
      console.warn(`⚠️ Failed to get hospital ${id}, checking fallback`);
      const fallback = getFallbackHospitals();
      return fallback.find((h) => h.id === id) ?? null;
    }
  },
};

// ============================================================
// FALLBACK DATA
// ============================================================
const getFallbackHospitals = (): HospitalSummary[] => [
  {
    id: "HOSP-001",
    name: "City General Hospital",
    address: "123 Main Street, Colombo 01",
    phone: "+94-11-2345678",
    email: "info@citygeneral.lk",
    type: "GENERAL",
  },
  {
    id: "HOSP-002",
    name: "St. Mary's Medical Center",
    address: "45 Church Road, Kandy",
    phone: "+94-81-2234567",
    email: "info@stmarys.lk",
    type: "SPECIALIZED",
  },
  {
    id: "HOSP-003",
    name: "National Hospital Colombo",
    address: "Regent Street, Colombo 08",
    phone: "+94-11-2691111",
    email: "info@nhc.lk",
    type: "GOVERNMENT",
  },
  {
    id: "HOSP-004",
    name: "Asiri Central Hospital",
    address: "Nawala Road, Nugegoda",
    phone: "+94-11-4523300",
    email: "info@asiri.lk",
    type: "PRIVATE",
  },
  {
    id: "HOSP-005",
    name: "Lanka Hospitals",
    address: "578 Elvitigala Mawatha, Colombo 05",
    phone: "+94-11-5430000",
    email: "info@lankahospitals.lk",
    type: "PRIVATE",
  },
];