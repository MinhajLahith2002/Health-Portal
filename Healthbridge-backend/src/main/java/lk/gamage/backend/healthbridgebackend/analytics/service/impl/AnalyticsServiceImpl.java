package lk.gamage.backend.healthbridgebackend.analytics.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsDashboardResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsKpiResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DepartmentPerformanceResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.OperationalSummaryResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.PatientTrendResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.ResourceUtilizationResponse;
import lk.gamage.backend.healthbridgebackend.analytics.dto.response.RevenueTrendResponse;
import lk.gamage.backend.healthbridgebackend.analytics.service.AnalyticsService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");

    @Override
    public AnalyticsDashboardResponse getDashboard(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);

        return new AnalyticsDashboardResponse(
                Instant.now(),
                period,
                DataAvailability.MOCK,
                kpis(period),
                patientTrends(),
                revenueTrend(),
                resourceUtilization(),
                departmentPerformance(),
                operationalSummary()
        );
    }

    private String normalizePeriod(String requestedPeriod) {
        String period = requestedPeriod == null ? "month" : requestedPeriod.trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_PERIODS.contains(period)) {
            throw new IllegalArgumentException(
                    "Invalid period '" + requestedPeriod + "'. Supported values: today, week, month, year"
            );
        }
        return period;
    }

    private List<AnalyticsKpiResponse> kpis(String period) {
        return switch (period) {
            case "today" -> kpiValues(48, 31, 24, 185_000, 36, 7);
            case "week" -> kpiValues(312, 118, 86, 720_000, 214, 42);
            case "year" -> kpiValues(8_964, 4_982, 3_741, 31_480_000, 10_704, 1_968);
            default -> kpiValues(1_248, 426, 318, 2_840_000, 892, 164);
        };
    }

    private List<AnalyticsKpiResponse> kpiValues(
            long patients,
            long appointments,
            long consultations,
            long revenue,
            long labTests,
            long insuranceClaims
    ) {
        return List.of(
                new AnalyticsKpiResponse("Total Patients", patients),
                new AnalyticsKpiResponse("Total Appointments", appointments),
                new AnalyticsKpiResponse("Total Consultations", consultations),
                new AnalyticsKpiResponse("Total Revenue", revenue),
                new AnalyticsKpiResponse("Lab Tests", labTests),
                new AnalyticsKpiResponse("Insurance Claims", insuranceClaims)
        );
    }

    private List<PatientTrendResponse> patientTrends() {
        return List.of(
                new PatientTrendResponse("Jan", 846),
                new PatientTrendResponse("Feb", 914),
                new PatientTrendResponse("Mar", 982),
                new PatientTrendResponse("Apr", 1_076),
                new PatientTrendResponse("May", 1_164),
                new PatientTrendResponse("Jun", 1_248)
        );
    }

    private List<RevenueTrendResponse> revenueTrend() {
        return List.of(
                new RevenueTrendResponse("Jan", 1_820_000),
                new RevenueTrendResponse("Feb", 1_960_000),
                new RevenueTrendResponse("Mar", 2_120_000),
                new RevenueTrendResponse("Apr", 2_360_000),
                new RevenueTrendResponse("May", 2_590_000),
                new RevenueTrendResponse("Jun", 2_840_000)
        );
    }

    private List<ResourceUtilizationResponse> resourceUtilization() {
        return List.of(
                new ResourceUtilizationResponse("Beds", 78),
                new ResourceUtilizationResponse("Staff", 86),
                new ResourceUtilizationResponse("Equipment", 64),
                new ResourceUtilizationResponse("Laboratory", 72)
        );
    }

    private List<DepartmentPerformanceResponse> departmentPerformance() {
        return List.of(
                new DepartmentPerformanceResponse("Emergency", 88),
                new DepartmentPerformanceResponse("Cardiology", 82),
                new DepartmentPerformanceResponse("General Medicine", 76),
                new DepartmentPerformanceResponse("Pediatrics", 91),
                new DepartmentPerformanceResponse("Laboratory", 79)
        );
    }

    private List<OperationalSummaryResponse> operationalSummary() {
        return List.of(
                new OperationalSummaryResponse("Emergency", 286, 104, 88, 690_000, "Watch"),
                new OperationalSummaryResponse("Cardiology", 214, 82, 82, 780_000, "Healthy"),
                new OperationalSummaryResponse("General Medicine", 338, 126, 76, 620_000, "Healthy"),
                new OperationalSummaryResponse("Pediatrics", 196, 71, 91, 430_000, "Attention"),
                new OperationalSummaryResponse("Laboratory", 214, 43, 72, 320_000, "Healthy")
        );
    }
}
