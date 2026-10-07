package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class SuperAdminDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingUserDto {
        private String id;
        private String name;
        private String role;
        private String timeAgo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private long totalUsers;
        private long totalHospitals;
        private long activeDoctors;
        private long activeSessions;
        private double systemHealthPercentage;
        private long securityAlerts;
        private double totalRevenue;
        private long pendingVerifications;
        private double monthlyRecurringRevenue;
        private double storageUsedPercentage;
        private List<PendingUserDto> topPendingApprovals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Growth {
        private String name;
        private long users;
        private long appointments;
        private double revenue;
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemAnalytics {
        private int dau;
        private int mau;
        private double stickiness;
        private double dauGrowth;
        private double mauGrowth;
        private List<FeatureAdoption> featureAdoption;
        private List<ModulePerformance> modulePerformance;
        private List<RevenueBreakdown> revenueBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureAdoption {
        private String name;
        private double percentage;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModulePerformance {
        private String name;
        private String active;
        private double score;
        private String growth;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueBreakdown {
        private String name;
        private double amount;
        private double percentage;
    }
}
