package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.math.BigDecimal;

public record FinancialSummaryResponse(
        DataAvailability status,
        long invoiceCount,
        BigDecimal billedRevenue,
        long paidInvoiceCount,
        long unpaidInvoiceCount,
        long partiallyPaidInvoiceCount,
        BigDecimal knownUnpaidInvoiceAmount,
        String limitation
) {
}
