import api from '@/lib/axios';

export const familyService = {
  getFamilyMembers: async (patientId: string) => {
    return await api.get<any[]>(`/family-members/patient/${patientId}`);
  },

  addFamilyMember: async (data: any) => {
    return await api.post('/family-members', data);
  },

  updateFamilyMember: async (id: string, data: any) => {
    return await api.put(`/family-members/${id}`, data);
  },

  deleteFamilyMember: async (id: string) => {
    return await api.delete(`/family-members/${id}`);
  }
};
