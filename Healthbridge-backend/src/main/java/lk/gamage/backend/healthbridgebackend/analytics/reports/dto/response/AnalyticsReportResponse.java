package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.AnalyticsReportType;

import java.time.Instant;
import java.util.List;

public record AnalyticsReportResponse(
        String reportId,
        Instant generatedAt,
        AnalyticsReportType reportType,
        String period,
        DataAvailability dataAvailability,
        String title,
        String summary,
        List<AnalyticsReportSectionResponse> sections,
        List<ReportAvailabilityResponse> exportAvailability,
        boolean persisted
) {
}
