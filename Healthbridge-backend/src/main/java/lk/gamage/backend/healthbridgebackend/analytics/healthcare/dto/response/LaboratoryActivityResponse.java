package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record LaboratoryActivityResponse(
        DataAvailability status,
        long totalOrders,
        long requested,
        long sampleCollected,
        long processing,
        long completed,
        long cancelled,
        String definition
) {
}
