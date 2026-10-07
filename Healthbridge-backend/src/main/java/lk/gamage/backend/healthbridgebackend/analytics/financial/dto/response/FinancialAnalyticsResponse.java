package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.time.Instant;
import java.util.List;

public record FinancialAnalyticsResponse(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<FinancialKpiResponse> kpis,
        List<RevenueTrendResponse> revenueTrend,
        RevenueSourceResponse revenueBySource,
        List<InvoiceStatusResponse> invoiceStatus,
        List<InvoiceStatusResponse> paymentStatus,
        FinancialSummaryResponse financialSummary,
        List<FinancialMetricAvailabilityResponse> availability
) {
}
