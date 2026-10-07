package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;

    // Overall KPI metrics
    private Long totalClaims;
    private Long approvedClaims;
    private Long pendingClaims;
    private Long rejectedClaims;
    private Long paidClaims;

    private Double totalClaimAmount;
    private Double totalApprovedAmount;
    private Double totalRejectedAmount;
    private Double totalPendingAmount;

    private Double approvalRate;
    private Double rejectionRate;
    private Double averageProcessingTimeHours;

    // Policy metrics
    private Long totalPolicies;
    private Long activePolicies;
    private Double totalCoverageIssued;
    private Double totalCoverageUsed;
    private Double totalCoverageRemaining;
    private Double policyUtilizationRate;

    // Breakdowns
    private Map<String, Long> statusCounts;
    private Map<String, Double> statusAmounts;
    private List<MonthlyTrendItem> monthlyTrends;
    private List<ProviderSummaryItem> providerSummaries;
    private List<InsuranceClaimResponse> claims;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendItem {
        private String month;
        private Integer year;
        private Long claimCount;
        private Long approvedCount;
        private Double totalRequested;
        private Double totalApproved;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderSummaryItem {
        private String providerName;
        private Long policyCount;
        private Long claimCount;
        private Double totalCoverage;
        private Double totalClaimed;
        private Double totalApproved;
    }
}
