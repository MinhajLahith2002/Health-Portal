package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.time.Instant;
import java.util.List;

public record ReportsAnalyticsResponseDTO(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<AnalyticsKpiDTO> kpis,
        List<ReportSummaryDTO> reports,
        List<ReportActivityDTO> reportActivity,
        List<CategoryDistributionDTO> categoryDistribution,
        List<ScheduledReportDTO> scheduledReports,
        List<DataAvailabilityDTO> availability
) {
}
