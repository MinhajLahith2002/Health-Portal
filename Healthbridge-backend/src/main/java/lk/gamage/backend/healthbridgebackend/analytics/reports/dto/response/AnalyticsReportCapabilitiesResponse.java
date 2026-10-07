package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.AnalyticsReportType;

import java.util.List;

public record AnalyticsReportCapabilitiesResponse(
        List<AnalyticsReportType> supportedReportTypes,
        List<String> supportedPeriods,
        ReportAvailabilityResponse previewGeneration,
        ReportAvailabilityResponse pdfExport,
        ReportAvailabilityResponse excelExport,
        ReportAvailabilityResponse recentReportPersistence,
        ReportAvailabilityResponse scheduledReports
) {
}
