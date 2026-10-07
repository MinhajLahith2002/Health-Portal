package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record OperationalKpiResponse(
        String name,
        BigDecimal value,
        String unit,
        DataAvailability status,
        String definition,
        String reason
) {
}
