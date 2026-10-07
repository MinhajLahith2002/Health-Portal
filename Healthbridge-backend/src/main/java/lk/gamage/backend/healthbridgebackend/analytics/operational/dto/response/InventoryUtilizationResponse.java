package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;
import java.util.List;

public record InventoryUtilizationResponse(
        DataAvailability status,
        long totalItems,
        List<InventoryStatusResponse> statusBreakdown,
        BigDecimal inventoryValue,
        long validValueRecords,
        long excludedValueRecords,
        String definition
) {
}
