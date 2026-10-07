package lk.gamage.backend.healthbridgebackend.analytics.healthcare.service;

import lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response.HealthcareAnalyticsResponse;

public interface HealthcareAnalyticsService {
    HealthcareAnalyticsResponse getHealthcareAnalytics(String period);
}
