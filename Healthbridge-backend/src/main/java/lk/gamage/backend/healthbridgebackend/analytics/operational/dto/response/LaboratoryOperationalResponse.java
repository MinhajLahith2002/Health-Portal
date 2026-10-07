package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;
import java.util.List;

public record LaboratoryOperationalResponse(
        DataAvailability status,
        long totalOrders,
        long eligibleOrders,
        long completedOrders,
        BigDecimal completionRate,
        List<StatusCount> orderStatus,
        List<StatusCount> sampleStatus,
        long linkedSamples,
        String orderDefinition,
        String sampleDefinition
) {
    public record StatusCount(String status, long count) {
    }
}
