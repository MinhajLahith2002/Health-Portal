package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.service;

import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response.PopulationHealthAnalyticsResponse;

public interface PopulationHealthAnalyticsService {
    PopulationHealthAnalyticsResponse getPopulationHealthAnalytics(String period);
}
