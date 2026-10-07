package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import java.math.BigDecimal;

public record RevenueTrendResponse(
        String periodLabel,
        BigDecimal billedRevenue,
        long invoiceCount
) {
}
