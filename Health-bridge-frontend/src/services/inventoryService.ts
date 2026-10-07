import { apiClient } from './apiClient';
import { HospitalInventory, HospitalInventoryRequest } from '@/types/hospital';

export const inventoryService = {
  createInventory: async (data: HospitalInventoryRequest): Promise<HospitalInventory> => {
    return apiClient.post<HospitalInventory>('/hospital-billing/inventory', data);
  },

  getAllInventory: async (): Promise<HospitalInventory[]> => {
    return apiClient.get<HospitalInventory[]>('/hospital-billing/inventory');
  },

  getInventoryById: async (id: string): Promise<HospitalInventory> => {
    return apiClient.get<HospitalInventory>(`/hospital-billing/inventory/${id}`);
  },

  getHospitalInventory: async (hospitalId: string): Promise<HospitalInventory[]> => {
    return apiClient.get<HospitalInventory[]>(`/hospital-billing/inventory/hospital/${hospitalId}`);
  },

  getLowStockItems: async (): Promise<HospitalInventory[]> => {
    return apiClient.get<HospitalInventory[]>('/hospital-billing/inventory/low-stock');
  },

  updateInventory: async (id: string, data: HospitalInventoryRequest): Promise<HospitalInventory> => {
    return apiClient.put<HospitalInventory>(`/hospital-billing/inventory/${id}`, data);
  },

  deleteInventory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/hospital-billing/inventory/${id}`);
  },
};