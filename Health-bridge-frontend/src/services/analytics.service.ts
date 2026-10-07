import api from "@/lib/axios";
import type { AnalyticsDashboardResponseDto, AnalyticsPeriod, FinancialAnalyticsResponseDto, OperationalAnalyticsResponseDto, PopulationHealthAnalyticsResponseDto, ReportsAnalyticsResponseDTO } from "@/types/analytics";
import type { HealthcareAnalyticsResponseDto } from "@/types/healthcareAnalytics";

export const analyticsService = {
  async getDashboard(period: AnalyticsPeriod): Promise<AnalyticsDashboardResponseDto> {
    return api.get<AnalyticsDashboardResponseDto>("/analytics/dashboard", {
      params: { period },
    });
  },
  async getHealthcare(period: AnalyticsPeriod, signal?: AbortSignal): Promise<HealthcareAnalyticsResponseDto> {
    return api.get<HealthcareAnalyticsResponseDto>("/analytics/healthcare", { params: { period }, signal });
  },
  async getFinancial(period: AnalyticsPeriod, signal?: AbortSignal): Promise<FinancialAnalyticsResponseDto> {
    return api.get<FinancialAnalyticsResponseDto>("/analytics/financial", { params: { period }, signal });
  },
  async getOperational(period: AnalyticsPeriod, signal?: AbortSignal): Promise<OperationalAnalyticsResponseDto> {
    return api.get<OperationalAnalyticsResponseDto>("/analytics/operational", { params: { period }, signal });
  },
  async getPopulationHealth(period: AnalyticsPeriod, signal?: AbortSignal): Promise<PopulationHealthAnalyticsResponseDto> {
    return api.get<PopulationHealthAnalyticsResponseDto>("/analytics/population-health", { params: { period }, signal });
  },
  async getReports(period: AnalyticsPeriod, signal?: AbortSignal): Promise<ReportsAnalyticsResponseDTO> {
    return api.get<ReportsAnalyticsResponseDTO>("/analytics/reports", { params: { period }, signal });
  },
};
