package lk.gamage.backend.healthbridgebackend.analytics.operational.service;

import lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response.OperationalAnalyticsResponse;

public interface OperationalAnalyticsService {
    OperationalAnalyticsResponse getOperationalAnalytics(String period);
}
