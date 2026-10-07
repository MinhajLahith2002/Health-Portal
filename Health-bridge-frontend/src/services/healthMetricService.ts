import api from '@/lib/axios';

export const healthMetricService = {
  getPatientMetrics: async (patientId: string) => {
    return await api.get<any[]>(`/health-metrics/patient/${patientId}`);
  },

  logMetric: async (data: any) => {
    return await api.post('/health-metrics', data);
  }
};
