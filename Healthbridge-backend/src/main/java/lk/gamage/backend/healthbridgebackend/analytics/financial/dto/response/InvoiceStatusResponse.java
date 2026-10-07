package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record InvoiceStatusResponse(
        String status,
        long count,
        DataAvailability dataAvailability
) {
}
