import { apiClient } from './apiClient';
import { Department, DepartmentStats } from '../types/department';

export const departmentService = {
  async getAll(status?: string, search?: string): Promise<Department[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    return apiClient.get<Department[]>('/departments', { params });
  },

  async getStats(): Promise<DepartmentStats> {
    return apiClient.get<DepartmentStats>('/departments/stats');
  },

  async getById(id: string): Promise<Department> {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  async create(data: Partial<Department>): Promise<Department> {
    return apiClient.post<Department>('/departments', data);
  },

  async update(id: string, data: Partial<Department>): Promise<Department> {
    return apiClient.put<Department>(`/departments/${id}`, data);
  },

  async updateStatus(id: string, status: 'Active' | 'Inactive'): Promise<Department> {
    return apiClient.patch<Department>(`/departments/${id}/status`, null, {
      params: { status }
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  }
};
