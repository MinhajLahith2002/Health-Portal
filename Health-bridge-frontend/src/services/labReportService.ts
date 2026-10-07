import api from '@/lib/axios';

export const labReportService = {
  getPatientLabHistory: async (patientId: string) => {
    const data = await api.get<any[]>(`/lab/results/patient/${patientId}/history`);
    return data.filter((r: any) => r.status !== 'DRAFT');
  }
};
