package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record FinancialKpiResponse(
        String name,
        BigDecimal value,
        DataAvailability status,
        String definition,
        String reason
) {
}
