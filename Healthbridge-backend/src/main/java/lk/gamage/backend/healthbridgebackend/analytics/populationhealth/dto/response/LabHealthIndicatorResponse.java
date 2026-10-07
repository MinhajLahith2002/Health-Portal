package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record LabHealthIndicatorResponse(
        DataAvailability status,
        long publishedResults,
        long abnormalResults,
        long criticalResults,
        BigDecimal abnormalResultPercentage,
        BigDecimal criticalResultPercentage,
        String denominator,
        String limitation
) {
}
