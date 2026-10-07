import api from "@/lib/axios";
import { InsuranceClaim, InsurancePolicy, PolicyStatus, ClaimDecisionRequest, InsuranceReportSummary } from "@/types/insurance";

const BASE = "/insurance";

export const insuranceService = {
  // --- patient-facing ---
  getMyPolicies: async (): Promise<InsurancePolicy[]> => {
    const res = await api.get<InsurancePolicy[] | { data?: InsurancePolicy[] }>(`${BASE}/policies/my`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  getMyClaims: async (): Promise<InsuranceClaim[]> => {
    const res = await api.get<InsuranceClaim[] | { data?: InsuranceClaim[] }>(`${BASE}/claims/my`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  getUnreadMessagesCount: async (): Promise<number> => {
    try {
      const res = await api.get<number | { count?: number }>(`${BASE}/messages/unread-count`);
      return typeof res === "number" ? res : (res?.count ?? 0);
    } catch {
      return 0; // Fails safely to 0 if backend is ever offline
    }
  },
  submitClaim: async (
    claim: {
      policyId: string;
      treatmentDescription: string;
      claimAmount: number;
      hospitalName?: string;
      branch?: string;
    },
    documents: File[]
  ): Promise<InsuranceClaim> => {
    const formData = new FormData();
    formData.append("claim", new Blob([JSON.stringify(claim)], { type: "application/json" }));
    documents.forEach((file) => formData.append("documents", file));
    const res = await api.post<InsuranceClaim | { data?: InsuranceClaim }>(`${BASE}/claims`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return (res as { data?: InsuranceClaim })?.data ?? (res as InsuranceClaim);
  },

  // --- admin/insurer-facing ---
  getAllPolicies: async (): Promise<InsurancePolicy[]> => {
    const res = await api.get<InsurancePolicy[] | { data?: InsurancePolicy[] }>(`${BASE}/policies`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  getAllClaims: async (): Promise<InsuranceClaim[]> => {
    const res = await api.get<InsuranceClaim[] | { data?: InsuranceClaim[] }>(`${BASE}/claims`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  getClaimById: async (id: string): Promise<InsuranceClaim> => {
    const res = await api.get<InsuranceClaim | { data?: InsuranceClaim }>(`${BASE}/claims/${id}`);
    return (res as { data?: InsuranceClaim })?.data ?? (res as InsuranceClaim);
  },
  getClaimsByPolicyId: async (policyId: string): Promise<InsuranceClaim[]> => {
    const res = await api.get<InsuranceClaim[] | { data?: InsuranceClaim[] }>(`${BASE}/policies/${policyId}/claims`);
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  decideClaim: async (id: string, decision: ClaimDecisionRequest): Promise<InsuranceClaim> => {
    const res = await api.patch<InsuranceClaim | { data?: InsuranceClaim }>(`${BASE}/claims/${id}/decision`, decision);
    return (res as { data?: InsuranceClaim })?.data ?? (res as InsuranceClaim);
  },
  startClaimReview: async (id: string): Promise<InsuranceClaim> => {
    const res = await api.patch<InsuranceClaim | { data?: InsuranceClaim }>(`${BASE}/claims/${id}/review`);
    return (res as { data?: InsuranceClaim })?.data ?? (res as InsuranceClaim);
  },
  getPolicyById: async (id: string): Promise<InsurancePolicy> => {
    const res = await api.get<InsurancePolicy | { data?: InsurancePolicy }>(`${BASE}/policies/${id}`);
    return (res as { data?: InsurancePolicy })?.data ?? (res as InsurancePolicy);
  },
  updatePolicyStatus: async (id: string, status: PolicyStatus): Promise<InsurancePolicy> => {
    const res = await api.patch<InsurancePolicy | { data?: InsurancePolicy }>(`${BASE}/policies/${id}/status?status=${status}`);
    return (res as { data?: InsurancePolicy })?.data ?? (res as InsurancePolicy);
  },
  createPolicy: async (payload: {
    patientId: string;
    policyNumber: string;
    providerName: string;
    policyType: string;
    coverageAmount: number;
    startDate: string;
    endDate: string;
  }): Promise<InsurancePolicy> => {
    const res = await api.post<InsurancePolicy | { data?: InsurancePolicy }>(`${BASE}/policies`, payload);
    return (res as { data?: InsurancePolicy })?.data ?? (res as InsurancePolicy);
  },
  verifyPolicy: async (policyNumber: string): Promise<InsurancePolicy> => {
    const res = await api.get<InsurancePolicy | { data?: InsurancePolicy }>(`${BASE}/policies/verify/${policyNumber}`);
    return (res as { data?: InsurancePolicy })?.data ?? (res as InsurancePolicy);
  },
  getReportSummary: async (startDate?: string, endDate?: string): Promise<InsuranceReportSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<InsuranceReportSummary | { data?: InsuranceReportSummary }>(`${BASE}/reports/summary${qs}`);
    return (res as { data?: InsuranceReportSummary })?.data ?? (res as InsuranceReportSummary);
  },
  getDocumentUrl: (fileIdOrUrl: string) => {
    if (!fileIdOrUrl) return "";
    if (fileIdOrUrl.startsWith("http://") || fileIdOrUrl.startsWith("https://")) {
      return fileIdOrUrl;
    }
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8088/api";
    return `${apiBase}${BASE}/documents/${fileIdOrUrl}`;
  },
};