import { apiClient } from './apiClient';
import { Bed, BedOverviewStats, DepartmentOccupancy, BedStatus } from '../types/bed';

export interface BedRequestPayload {
  bedId?: string;
  code: string;
  ward: string;
  status: BedStatus;
  bedType?: string;
  branchId?: string;
  branchCode?: string;
}

export interface BedAllocationPayload {
  searchPatient?: string;
  firstName: string;
  lastName: string;
  patientId: string;
  department: string;
  bedType: string;
  assignedDoctor: string;
  admissionDate: string;
  expDischarge?: string;
  admissionNotes?: string;
}

export interface BedTransferPayload {
  destinationWard: string;
  availableBedId: string;
  reason?: string;
  transferDate?: string;
  transferTime?: string;
  priority?: 'Routine' | 'Urgent';
}

export const bedService = {
  async getAll(ward?: string, status?: string, search?: string): Promise<Bed[]> {
    const params = new URLSearchParams();
    if (ward && ward !== 'All') params.append('ward', ward);
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    return apiClient.get<Bed[]>('/beds', { params });
  },

  async getStats(): Promise<BedOverviewStats> {
    return apiClient.get<BedOverviewStats>('/beds/stats');
  },

  async getOccupancy(): Promise<DepartmentOccupancy[]> {
    return apiClient.get<DepartmentOccupancy[]>('/beds/occupancy');
  },

  async getById(id: string): Promise<Bed> {
    return apiClient.get<Bed>(`/beds/${id}`);
  },

  async create(data: BedRequestPayload): Promise<Bed> {
    return apiClient.post<Bed>('/beds', data);
  },

  async update(id: string, data: Partial<BedRequestPayload>): Promise<Bed> {
    return apiClient.put<Bed>(`/beds/${id}`, data);
  },

  async updateStatus(id: string, status: BedStatus): Promise<Bed> {
    return apiClient.patch<Bed>(`/beds/${id}/status`, null, {
      params: { status }
    });
  },

  async allocate(id: string, payload: BedAllocationPayload): Promise<Bed> {
    return apiClient.post<Bed>(`/beds/${id}/allocate`, payload);
  },

  async transfer(id: string, payload: BedTransferPayload): Promise<Bed> {
    return apiClient.post<Bed>(`/beds/${id}/transfer`, payload);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/beds/${id}`);
  }
};
