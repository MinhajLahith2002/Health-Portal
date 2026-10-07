import { apiClient } from './apiClient';
import { ComplianceReport, ComplianceReportRequest } from '@/types/hospital';

export const complianceService = {
  createReport: async (data: ComplianceReportRequest): Promise<ComplianceReport> => {
    return apiClient.post<ComplianceReport>('/hospital-billing/compliance', data);
  },

  getAllReports: async (): Promise<ComplianceReport[]> => {
    return apiClient.get<ComplianceReport[]>('/hospital-billing/compliance');
  },

  getReportById: async (id: string): Promise<ComplianceReport> => {
    return apiClient.get<ComplianceReport>(`/hospital-billing/compliance/${id}`);
  },

  getHospitalReports: async (hospitalId: string): Promise<ComplianceReport[]> => {
    return apiClient.get<ComplianceReport[]>(`/hospital-billing/compliance/hospital/${hospitalId}`);
  },

  updateReport: async (id: string, data: ComplianceReportRequest): Promise<ComplianceReport> => {
    return apiClient.put<ComplianceReport>(`/hospital-billing/compliance/${id}`, data);
  },

  deleteReport: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/hospital-billing/compliance/${id}`);
  },
};