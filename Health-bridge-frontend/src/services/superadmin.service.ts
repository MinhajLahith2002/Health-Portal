import api from "@/lib/axios";

export interface SuperAdminStatsDto {
  totalUsers: number;
  totalHospitals: number;
  activeDoctors: number;
  activeSessions: number;
  systemHealthPercentage: number;
  securityAlerts: number;
  totalRevenue: number;
  pendingVerifications: number;
  monthlyRecurringRevenue: number;
  storageUsedPercentage: number;
  topPendingApprovals: {
    id: string;
    name: string;
    role: string;
    timeAgo: string;
  }[];
}

export interface UserProfileResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  role: string;
  accountStatus: string;
  createdAt: string;
  updatedAt?: string;
  picture?: string;
}

export interface SuperAdminGrowthDto {
  name: string;
  users: number;
  appointments: number;
  revenue: number;
}

export interface SystemAnalyticsDto {
  dau: number;
  mau: number;
  stickiness: number;
  dauGrowth: number;
  mauGrowth: number;
  featureAdoption: {
    name: string;
    percentage: number;
    label: string;
  }[];
  modulePerformance: {
    name: string;
    active: string;
    score: number;
    growth: string;
    status: string;
  }[];
  revenueBreakdown: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  event: string;
  module: string;
  actionDetails: string;
  refId: string;
  ipDevice: string;
  status: string;
  severity: string;
}

export interface AuditLogSummary {
  totalToday: number;
  authEvents: number;
  adminActions: number;
  recordAccess: number;
  securityEvents: number;
  failedActions: number;
}

export const superAdminService = {
  async getDashboardStats(): Promise<SuperAdminStatsDto> {
    return api.get<SuperAdminStatsDto>("/super-admin/dashboard/stats");
  },
  
  async getGrowthData(): Promise<SuperAdminGrowthDto[]> {
    return api.get<SuperAdminGrowthDto[]>("/super-admin/dashboard/growth");
  },

  async getSystemAnalytics(): Promise<SystemAnalyticsDto> {
    return api.get<SystemAnalyticsDto>("/super-admin/dashboard/analytics");
  },

  async getAllUsers(): Promise<UserProfileResponse[]> {
    return api.get<UserProfileResponse[]>("/users");
  },

  async getAllStaff(): Promise<UserProfileResponse[]> {
    return api.get<UserProfileResponse[]>("/staff");
  },

  async createStaff(data: any): Promise<any> {
    return api.post<any>("/staff", data);
  },

  async getStaffById(id: string): Promise<any> {
    return api.get<any>(`/staff/${id}`);
  },

  async updateStaffDetails(id: string, data: any): Promise<any> {
    return api.put<any>(`/staff/${id}`, data);
  },

  async updateUserStatus(id: string, status: string): Promise<UserProfileResponse> {
    return api.patch<UserProfileResponse>(`/staff/${id}/account-status?status=${status}`);
  },

  async deleteUser(id: string): Promise<void> {
    return api.delete(`/users/${id}`);
  },

  async updateUserDetails(id: string, data: any): Promise<UserProfileResponse> {
    return api.put<UserProfileResponse>(`/users/${id}`, data);
  },

  async downloadDashboardReport(): Promise<void> {
    const blobData: Blob = await api.get("/super-admin/dashboard/report", {
      responseType: 'blob'
    }) as any;
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  async downloadAnalyticsReport(): Promise<void> {
    const blobData: Blob = await api.get("/super-admin/dashboard/analytics/report", {
      responseType: 'blob'
    }) as any;
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `System_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return api.get<AuditLog[]>("/admin/audit-logs");
  },

  async getAuditLogSummary(): Promise<AuditLogSummary> {
    return api.get<AuditLogSummary>("/admin/audit-logs/summary");
  },

  async downloadAuditReport(): Promise<void> {
    const blobData: Blob = await api.get("/admin/audit-logs/report", {
      responseType: 'blob'
    }) as any;
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};
