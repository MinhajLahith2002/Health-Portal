package lk.gamage.backend.healthbridgebackend.analytics.dto.response;

import java.time.Instant;
import java.util.List;

public record AnalyticsDashboardResponse(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<AnalyticsKpiResponse> kpis,
        List<PatientTrendResponse> patientTrends,
        List<RevenueTrendResponse> revenueTrend,
        List<ResourceUtilizationResponse> resourceUtilization,
        List<DepartmentPerformanceResponse> departmentPerformance,
        List<OperationalSummaryResponse> operationalSummary
) {
}
