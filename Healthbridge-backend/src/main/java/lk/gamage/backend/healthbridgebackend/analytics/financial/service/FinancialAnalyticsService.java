package lk.gamage.backend.healthbridgebackend.analytics.financial.service;

import lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response.FinancialAnalyticsResponse;

public interface FinancialAnalyticsService {
    FinancialAnalyticsResponse getFinancialAnalytics(String period);
}
