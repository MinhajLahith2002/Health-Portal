package lk.gamage.backend.healthbridgebackend.analytics.operational.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public interface OperationalAnalyticsReadRepository {

    InventoryData summarizeInventory();

    LabOrderData summarizeLabOrders(Instant start, Instant end);

    Map<String, Long> countLinkedSampleStatuses(Instant start, Instant end);

    TurnaroundData calculatePublishedResultTurnaround(Instant start, Instant end);

    record InventoryData(
            long totalItems,
            Map<String, Long> statusCounts,
            BigDecimal inventoryValue,
            long validValueRecords
    ) {
    }

    record LabOrderData(long totalOrders, Map<String, Long> statusCounts) {
    }

    record TurnaroundData(BigDecimal averageHours, long validRecords) {
    }
}
