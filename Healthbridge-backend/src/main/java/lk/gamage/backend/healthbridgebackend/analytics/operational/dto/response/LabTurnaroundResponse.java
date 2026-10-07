package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record LabTurnaroundResponse(
        DataAvailability status,
        BigDecimal averageHours,
        long eligibleRecords,
        long validRecords,
        long excludedRecords,
        String definition
) {
}
