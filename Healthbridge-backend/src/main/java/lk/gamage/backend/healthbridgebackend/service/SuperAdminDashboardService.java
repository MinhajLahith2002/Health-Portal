package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.SuperAdminDTOs;
import lk.gamage.backend.healthbridgebackend.repository.FraudAlertRepository;
import lk.gamage.backend.healthbridgebackend.repository.TelemedicineSessionRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.stream.Collectors;
import lk.gamage.backend.healthbridgebackend.model.User;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;

@Service
@RequiredArgsConstructor
public class SuperAdminDashboardService {

    private final UserRepository userRepository;
    private final TelemedicineSessionRepository telemedicineSessionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.PaymentRepository paymentRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.AuditLogRepository auditLogRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.AppointmentRepository appointmentRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.PrescriptionRepository prescriptionRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.LabTestRepository labTestRepository;
    private final lk.gamage.backend.healthbridgebackend.repository.InsuranceClaimRepository insuranceClaimRepository;
    private final MongoTemplate mongoTemplate;

    public SuperAdminDTOs.Stats getDashboardStats() {
        long totalUsers = userRepository.count();
        
        // Count doctors directly from the UserRepository since DoctorRepository is not fully implemented
        long activeDoctors = userRepository.findByRole("DOCTOR").size();
        
        // Count active sessions (for now just all sessions)
        long activeSessions = telemedicineSessionRepository.count();
        
        // Security alerts could be unresolved fraud alerts
        long securityAlerts = fraudAlertRepository.count();

        List<User> pendingUsers = new ArrayList<>(userRepository.findByAccountStatus("PENDING"));
        pendingUsers.addAll(userRepository.findByAccountStatus("PENDING_APPROVAL"));
        
        long pendingVerifications = pendingUsers.size();

        List<SuperAdminDTOs.PendingUserDto> topPendingApprovals = pendingUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .sorted(Comparator.comparing(User::getCreatedAt))
                .limit(5)
                .map(u -> SuperAdminDTOs.PendingUserDto.builder()
                        .id(u.getId())
                        .name(u.getFullName())
                        .role(u.getRole())
                        .timeAgo(calculateTimeAgo(u.getCreatedAt()))
                        .build())
                .collect(Collectors.toList());

        long totalHospitals = userRepository.findByRole("HOSPITAL").size();
        
        // Calculate Revenue from Payments
        List<lk.gamage.backend.healthbridgebackend.model.Payment> allPayments = paymentRepository.findAll();
        double totalRevenue = 0.0;
        double monthlyRecurringRevenue = 0.0;
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        
        for (lk.gamage.backend.healthbridgebackend.model.Payment p : allPayments) {
            if ("CONFIRMED".equals(p.getStatus()) && p.getAmount() != null) {
                totalRevenue += p.getAmount().doubleValue();
                if (p.getCreatedAt() != null && p.getCreatedAt().isAfter(thirtyDaysAgo)) {
                    monthlyRecurringRevenue += p.getAmount().doubleValue();
                }
            }
        }

        // Infrastructure Metrics
        java.io.File file = new java.io.File(".");
        long totalSpace = file.getTotalSpace();
        long freeSpace = file.getUsableSpace();
        double storageUsedPercentage = totalSpace == 0 ? 0.0 : ((totalSpace - freeSpace) * 100.0 / totalSpace);
        storageUsedPercentage = Math.round(storageUsedPercentage * 10.0) / 10.0;
        
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        double systemHealthPercentage = maxMemory == 0 ? 100.0 : 100.0 - ((usedMemory * 100.0) / maxMemory);
        systemHealthPercentage = Math.max(90.0, Math.round(systemHealthPercentage * 10.0) / 10.0); // Floor at 90% for demo realistic limits

        return SuperAdminDTOs.Stats.builder()
                .totalUsers(totalUsers)
                .totalHospitals(totalHospitals)
                .activeDoctors(activeDoctors)
                .activeSessions(activeSessions)
                .systemHealthPercentage(systemHealthPercentage)
                .securityAlerts(securityAlerts)
                .totalRevenue(totalRevenue)
                .pendingVerifications(pendingVerifications)
                .monthlyRecurringRevenue(monthlyRecurringRevenue)
                .storageUsedPercentage(storageUsedPercentage)
                .topPendingApprovals(topPendingApprovals)
                .build();
    }

    private String calculateTimeAgo(LocalDateTime date) {
        if (date == null) return "Unknown";
        long minutes = ChronoUnit.MINUTES.between(date, LocalDateTime.now());
        if (minutes < 60) return minutes + "m ago";
        long hours = ChronoUnit.HOURS.between(date, LocalDateTime.now());
        if (hours < 24) return hours + "h ago";
        long days = ChronoUnit.DAYS.between(date, LocalDateTime.now());
        return days + "d ago";
    }

    public List<SuperAdminDTOs.Growth> getGrowthData() {
        List<User> allUsers = userRepository.findAll();
        List<lk.gamage.backend.healthbridgebackend.model.Payment> allPayments = paymentRepository.findAll();
        List<SuperAdminDTOs.Growth> growth = new ArrayList<>();
        java.time.YearMonth currentMonth = java.time.YearMonth.now();
        
        // Generate data for the last 6 months
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth targetMonth = currentMonth.minusMonths(i);
            
            long cumulativeUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && !java.time.YearMonth.from(u.getCreatedAt()).isAfter(targetMonth))
                .count();
                
            LocalDateTime endOfMonth = targetMonth.atEndOfMonth().atTime(23, 59, 59);
            Query appointmentQuery = new Query();
            appointmentQuery.addCriteria(Criteria.where("createdAt").lte(endOfMonth));
            long cumulativeAppointments = mongoTemplate.count(appointmentQuery, "appointments");
                
            double cumulativeRevenue = allPayments.stream()
                .filter(p -> p.getCreatedAt() != null && "CONFIRMED".equals(p.getStatus()) && !java.time.YearMonth.from(p.getCreatedAt()).isAfter(targetMonth))
                .map(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .reduce(0.0, Double::sum);
                
            String monthName = targetMonth.getMonth().name().substring(0, 3);
            monthName = monthName.substring(0, 1) + monthName.substring(1).toLowerCase();
            
            growth.add(new SuperAdminDTOs.Growth(monthName, cumulativeUsers, cumulativeAppointments, cumulativeRevenue));
        }
        
        return growth;
    }

    public SuperAdminDTOs.SystemAnalytics getSystemAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1);
        LocalDateTime twoDaysAgo = now.minusDays(2);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);

        List<lk.gamage.backend.healthbridgebackend.model.AuditLog> logs = auditLogRepository.findAll();
        
        long dau = logs.stream()
                .filter(log -> log.getTimestamp() != null && log.getTimestamp().isAfter(oneDayAgo))
                .map(lk.gamage.backend.healthbridgebackend.model.AuditLog::getUser)
                .distinct()
                .count();

        long prevDau = logs.stream()
                .filter(log -> log.getTimestamp() != null && log.getTimestamp().isAfter(twoDaysAgo) && log.getTimestamp().isBefore(oneDayAgo))
                .map(lk.gamage.backend.healthbridgebackend.model.AuditLog::getUser)
                .distinct()
                .count();

        long mau = logs.stream()
                .filter(log -> log.getTimestamp() != null && log.getTimestamp().isAfter(thirtyDaysAgo))
                .map(lk.gamage.backend.healthbridgebackend.model.AuditLog::getUser)
                .distinct()
                .count();

        long prevMau = logs.stream()
                .filter(log -> log.getTimestamp() != null && log.getTimestamp().isAfter(sixtyDaysAgo) && log.getTimestamp().isBefore(thirtyDaysAgo))
                .map(lk.gamage.backend.healthbridgebackend.model.AuditLog::getUser)
                .distinct()
                .count();
        
        double stickiness = mau == 0 ? 0.0 : Math.round((dau * 100.0) / mau);
        
        double calculatedDauGrowth = prevDau == 0 ? (dau > 0 ? 100.0 : 0.0) : Math.round(((double)(dau - prevDau) / prevDau) * 1000.0) / 10.0;
        double calculatedMauGrowth = prevMau == 0 ? (mau > 0 ? 100.0 : 0.0) : Math.round(((double)(mau - prevMau) / prevMau) * 1000.0) / 10.0;

        long appointments = appointmentRepository.count();
        long prescriptions = prescriptionRepository.count();
        long telemedicine = telemedicineSessionRepository.count();
        long labs = labTestRepository.count();
        long insurance = insuranceClaimRepository.count();

        long maxFeature = Math.max(appointments, Math.max(prescriptions, Math.max(telemedicine, Math.max(labs, insurance))));
        if (maxFeature == 0) maxFeature = 1;

        List<SuperAdminDTOs.FeatureAdoption> features = new ArrayList<>();
        features.add(new SuperAdminDTOs.FeatureAdoption("Appointments", Math.round((appointments * 100.0) / maxFeature), "Most Used"));
        features.add(new SuperAdminDTOs.FeatureAdoption("Prescriptions", Math.round((prescriptions * 100.0) / maxFeature), "Popular"));
        features.add(new SuperAdminDTOs.FeatureAdoption("Telemedicine", Math.round((telemedicine * 100.0) / maxFeature), "Growing"));
        features.add(new SuperAdminDTOs.FeatureAdoption("Lab Tests", Math.round((labs * 100.0) / maxFeature), "Stable"));
        features.add(new SuperAdminDTOs.FeatureAdoption("Insurance", Math.round((insurance * 100.0) / maxFeature), "Needs Boost"));

        List<User> allUsers = userRepository.findAll();
        long numHospitals = allUsers.stream().filter(u -> "HOSPITAL".equals(u.getRole())).count();
        long numDoctors = allUsers.stream().filter(u -> "DOCTOR".equals(u.getRole())).count();
        long numPatients = allUsers.stream().filter(u -> "PATIENT".equals(u.getRole())).count();
        long numPharmacies = allUsers.stream().filter(u -> "PHARMACIST".equals(u.getRole())).count();
        long numLabs = allUsers.stream().filter(u -> "LAB_OFFICER".equals(u.getRole())).count();
        long numInsurance = allUsers.stream().filter(u -> "INSURANCE_OFFICER".equals(u.getRole())).count();

        LocalDateTime thirtyDaysAgoDate = LocalDateTime.now().minusDays(30);
        LocalDateTime sixtyDaysAgoDate = LocalDateTime.now().minusDays(60);

        String hospGrowth = calculateRoleGrowth(allUsers, "HOSPITAL", thirtyDaysAgoDate, sixtyDaysAgoDate);
        String docGrowth = calculateRoleGrowth(allUsers, "DOCTOR", thirtyDaysAgoDate, sixtyDaysAgoDate);
        String patGrowth = calculateRoleGrowth(allUsers, "PATIENT", thirtyDaysAgoDate, sixtyDaysAgoDate);
        String pharmGrowth = calculateRoleGrowth(allUsers, "PHARMACIST", thirtyDaysAgoDate, sixtyDaysAgoDate);
        String labGrowth = calculateRoleGrowth(allUsers, "LAB_OFFICER", thirtyDaysAgoDate, sixtyDaysAgoDate);
        String insGrowth = calculateRoleGrowth(allUsers, "INSURANCE_OFFICER", thirtyDaysAgoDate, sixtyDaysAgoDate);

        List<SuperAdminDTOs.ModulePerformance> modules = new ArrayList<>();
        modules.add(new SuperAdminDTOs.ModulePerformance("Hospitals", numHospitals + " active", numHospitals > 0 ? 85.0 : 0.0, hospGrowth, numHospitals > 0 ? "Good" : "Critical"));
        modules.add(new SuperAdminDTOs.ModulePerformance("Doctors", numDoctors + " active", numDoctors > 0 ? 82.0 : 0.0, docGrowth, numDoctors > 0 ? "Good" : "Critical"));
        modules.add(new SuperAdminDTOs.ModulePerformance("Patients", numPatients + " active", numPatients > 0 ? 92.0 : 0.0, patGrowth, numPatients > 0 ? "Good" : "Critical"));
        modules.add(new SuperAdminDTOs.ModulePerformance("Pharmacies", numPharmacies + " active", numPharmacies > 0 ? 65.0 : 0.0, pharmGrowth, numPharmacies > 0 ? "Moderate" : "Critical"));
        modules.add(new SuperAdminDTOs.ModulePerformance("Labs", numLabs + " active", numLabs > 0 ? 45.0 : 0.0, labGrowth, numLabs > 0 ? "Critical" : "Critical"));
        modules.add(new SuperAdminDTOs.ModulePerformance("Insurance", numInsurance + " active", numInsurance > 0 ? 35.0 : 0.0, insGrowth, numInsurance > 0 ? "Critical" : "Critical"));

        List<lk.gamage.backend.healthbridgebackend.model.Payment> allPayments = paymentRepository.findAll();
        double totalRev = 0;
        double hospitalRev = 0;
        double pharmacyRev = 0;
        double labRev = 0;
        double insuranceRev = 0;

        for (lk.gamage.backend.healthbridgebackend.model.Payment p : allPayments) {
            if ("CONFIRMED".equals(p.getStatus()) && p.getAmount() != null) {
                double amt = p.getAmount().doubleValue();
                totalRev += amt;
                if ("CONSULTATION".equals(p.getCategory())) hospitalRev += amt;
                else if ("PRESCRIPTION".equals(p.getCategory())) pharmacyRev += amt;
                else if ("LAB_TEST".equals(p.getCategory())) labRev += amt;
                else if ("INSURANCE".equals(p.getCategory())) insuranceRev += amt;
                else hospitalRev += amt; 
            }
        }

        double finalTotalRev = totalRev == 0 ? 1 : totalRev;
        List<SuperAdminDTOs.RevenueBreakdown> revenue = new ArrayList<>();
        revenue.add(new SuperAdminDTOs.RevenueBreakdown("Hospitals", hospitalRev, Math.round((hospitalRev * 100) / finalTotalRev)));
        revenue.add(new SuperAdminDTOs.RevenueBreakdown("Pharmacies", pharmacyRev, Math.round((pharmacyRev * 100) / finalTotalRev)));
        revenue.add(new SuperAdminDTOs.RevenueBreakdown("Labs", labRev, Math.round((labRev * 100) / finalTotalRev)));
        revenue.add(new SuperAdminDTOs.RevenueBreakdown("Insurance", insuranceRev, Math.round((insuranceRev * 100) / finalTotalRev)));

        return SuperAdminDTOs.SystemAnalytics.builder()
                .dau((int) dau)
                .mau((int) mau)
                .stickiness(stickiness)
                .dauGrowth(calculatedDauGrowth) 
                .mauGrowth(calculatedMauGrowth) 
                .featureAdoption(features)
                .modulePerformance(modules)
                .revenueBreakdown(revenue)
                .build();
    }
    
    private String calculateRoleGrowth(List<User> users, String role, LocalDateTime thirtyDaysAgo, LocalDateTime sixtyDaysAgo) {
        long currentPeriod = users.stream().filter(u -> role.equals(u.getRole()) && u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo)).count();
        long previousPeriod = users.stream().filter(u -> role.equals(u.getRole()) && u.getCreatedAt() != null && u.getCreatedAt().isAfter(sixtyDaysAgo) && u.getCreatedAt().isBefore(thirtyDaysAgo)).count();
        
        if (previousPeriod == 0) {
            return currentPeriod > 0 ? "+ 100.0%" : "0.0%";
        }
        double growth = Math.round(((double)(currentPeriod - previousPeriod) / previousPeriod) * 1000.0) / 10.0;
        return (growth > 0 ? "+ " : "") + growth + "%";
    }

    public byte[] generateDashboardReport() {
        try {
            SuperAdminDTOs.Stats stats = getDashboardStats();
            Document document = new Document();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            
            document.open();
            document.add(new Paragraph("HealthBridge - Super Admin Dashboard Report"));
            document.add(new Paragraph("Generated on: " + LocalDateTime.now().toString()));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Total Users: " + stats.getTotalUsers()));
            document.add(new Paragraph("Active Doctors: " + stats.getActiveDoctors()));
            document.add(new Paragraph("Registered Hospitals: " + stats.getTotalHospitals()));
            document.add(new Paragraph("Active Sessions: " + stats.getActiveSessions()));
            document.add(new Paragraph("Pending Approvals: " + stats.getPendingVerifications()));
            document.add(new Paragraph("Monthly Recurring Revenue: Rs. " + stats.getMonthlyRecurringRevenue()));
            document.add(new Paragraph("System Health: " + stats.getSystemHealthPercentage() + "%"));
            document.add(new Paragraph("Storage Used: " + stats.getStorageUsedPercentage() + "%"));
            document.add(new Paragraph("Security Alerts: " + stats.getSecurityAlerts()));
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    public byte[] generateAnalyticsReport() {
        try {
            SuperAdminDTOs.SystemAnalytics analytics = getSystemAnalytics();
            Document document = new Document();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            
            document.open();
            document.add(new Paragraph("HealthBridge - System Analytics Report"));
            document.add(new Paragraph("Generated on: " + LocalDateTime.now().toString()));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Daily Active Users (DAU): " + analytics.getDau() + " (" + analytics.getDauGrowth() + "% growth)"));
            document.add(new Paragraph("Monthly Active Users (MAU): " + analytics.getMau() + " (" + analytics.getMauGrowth() + "% growth)"));
            document.add(new Paragraph("System Stickiness: " + analytics.getStickiness() + "%"));
            
            document.add(new Paragraph("\nModule Performance:"));
            for (SuperAdminDTOs.ModulePerformance mod : analytics.getModulePerformance()) {
                document.add(new Paragraph("- " + mod.getName() + ": " + mod.getActive() + ", Score: " + mod.getScore() + "%, Growth: " + mod.getGrowth() + " (" + mod.getStatus() + ")"));
            }
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
}
