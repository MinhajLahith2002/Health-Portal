package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record OperationalSummaryResponse(
        DataAvailability status,
        long inventoryItems,
        long lowStockItems,
        long outOfStockItems,
        long laboratoryOrders,
        BigDecimal laboratoryCompletionRate,
        BigDecimal averageLaboratoryTurnaroundHours,
        long turnaroundValidRecords,
        OperationalMetricAvailabilityResponse departmentPerformance
) {
}
