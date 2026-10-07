package lk.gamage.backend.healthbridgebackend.analytics.service;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsDashboardResponse;

public interface AnalyticsService {
    AnalyticsDashboardResponse getDashboard(String period);
}
