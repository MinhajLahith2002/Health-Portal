package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;
import java.util.List;

public record RevenueSourceResponse(
        DataAvailability status,
        List<Source> sources,
        long totalBillingItems,
        long categorizedBillingItems,
        long uncategorizedBillingItems,
        String note
) {
    public record Source(String category, BigDecimal billedAmount, long billingItemCount) {
    }
}
