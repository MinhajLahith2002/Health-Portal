import { apiClient } from './apiClient';
import { EquipmentAsset, EquipmentOverviewStats } from '@/types/equipment';

export const equipmentService = {
  getAll: async (params?: { category?: string; department?: string; status?: string; search?: string }): Promise<EquipmentAsset[]> => {
    return apiClient.get<EquipmentAsset[]>('/equipment', { params });
  },

  getStats: async (): Promise<EquipmentOverviewStats> => {
    return apiClient.get<EquipmentOverviewStats>('/equipment/stats');
  },

  getById: async (id: string): Promise<EquipmentAsset> => {
    return apiClient.get<EquipmentAsset>(`/equipment/${id}`);
  },

  create: async (data: Partial<EquipmentAsset>): Promise<EquipmentAsset> => {
    return apiClient.post<EquipmentAsset>('/equipment', data);
  },

  update: async (id: string, data: Partial<EquipmentAsset>): Promise<EquipmentAsset> => {
    return apiClient.put<EquipmentAsset>(`/equipment/${id}`, data);
  },

  updateStatus: async (id: string, status: string): Promise<EquipmentAsset> => {
    return apiClient.patch<EquipmentAsset>(`/equipment/${id}/status`, null, {
      params: { status }
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/equipment/${id}`);
  },

  getLocationsByDepartment: async (department?: string): Promise<string[]> => {
    return apiClient.get<string[]>('/equipment/locations', {
      params: { department }
    });
  }
};
