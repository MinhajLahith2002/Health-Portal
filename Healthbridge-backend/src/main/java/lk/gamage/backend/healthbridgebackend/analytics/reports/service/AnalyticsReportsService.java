package lk.gamage.backend.healthbridgebackend.analytics.reports.service;

import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.GenerateAnalyticsReportRequest;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.AnalyticsReportCapabilitiesResponse;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.AnalyticsReportResponse;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.ReportsAnalyticsResponseDTO;

public interface AnalyticsReportsService {
    AnalyticsReportResponse generatePreview(GenerateAnalyticsReportRequest request);

    AnalyticsReportCapabilitiesResponse getCapabilities();

    ReportsAnalyticsResponseDTO getReportsAnalytics(String period);
}
