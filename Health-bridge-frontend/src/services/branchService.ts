import api from "@/lib/axios";

export interface Branch {
  id: string;
  branchCode: string;
  branchName: string;
  hospitalId?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE";
  totalBeds?: number;
  emergencyReady?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchInput {
  branchCode: string;
  branchName: string;
  hospitalId?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  status?: "ACTIVE" | "INACTIVE";
  totalBeds?: number;
  emergencyReady?: boolean;
}

export const branchService = {
  getAllBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get<Branch[]>("/branches");
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn("⚠️ Branch API unavailable, returning empty list");
      return [];
    }
  },

  getBranchById: async (id: string): Promise<Branch | null> => {
    try {
      return await api.get<Branch>(`/branches/${id}`);
    } catch (error) {
      console.error(`Failed to load branch ${id}:`, error);
      return null;
    }
  },

  createBranch: async (input: BranchInput): Promise<Branch> => {
    return api.post<Branch>("/branches", input);
  },

  updateBranch: async (id: string, input: Partial<BranchInput>): Promise<Branch> => {
    return api.put<Branch>(`/branches/${id}`, input);
  },

  deleteBranch: async (id: string): Promise<void> => {
    return api.delete<void>(`/branches/${id}`);
  },
};
