import { apiClient } from './apiClient';
import { StaffMember, DutyStatus, StaffOverviewStats } from '../types/staff';

export const staffService = {
  async getAll(
    department?: string,
    dutyStatus?: string,
    accountStatus?: string,
    search?: string
  ): Promise<StaffMember[]> {
    const params = new URLSearchParams();
    if (department && department !== 'All') params.append('department', department);
    if (dutyStatus && dutyStatus !== 'All') params.append('dutyStatus', dutyStatus);
    if (accountStatus && accountStatus !== 'All') params.append('accountStatus', accountStatus);
    if (search) params.append('search', search);

    return apiClient.get<StaffMember[]>('/staff', { params });
  },

  async getStats(): Promise<StaffOverviewStats> {
    return apiClient.get<StaffOverviewStats>('/staff/stats');
  },

  async getById(id: string): Promise<StaffMember> {
    return apiClient.get<StaffMember>(`/staff/${id}`);
  },

  async create(data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.post<StaffMember>('/staff', data);
  },

  async update(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.put<StaffMember>(`/staff/${id}`, data);
  },

  async updateDutyStatus(id: string, status: DutyStatus): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`/staff/${id}/duty-status`, null, {
      params: { status }
    });
  },

  async updateAccountStatus(id: string, status: 'Active' | 'Suspended'): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`/staff/${id}/account-status`, null, {
      params: { status }
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/staff/${id}`);
  }
};
