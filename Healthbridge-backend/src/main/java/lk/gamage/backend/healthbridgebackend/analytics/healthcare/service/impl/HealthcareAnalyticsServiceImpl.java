package lk.gamage.backend.healthbridgebackend.analytics.healthcare.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.repository.HealthcareAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.service.HealthcareAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HealthcareAnalyticsServiceImpl implements HealthcareAnalyticsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");
    private static final String PATIENT_DEFINITION = "Counts registered patient accounts (users where role = PATIENT).";
    private static final String LAB_DEFINITION = "Counts laboratory test orders, not individual assays.";

    private final HealthcareAnalyticsReadRepository repository;

    @Override
    public HealthcareAnalyticsResponse getHealthcareAnalytics(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime now = LocalDateTime.now(zone);
        PeriodWindow window = periodWindow(period, now, zone);

        long totalPatients = repository.countPatientAccounts();
        long newPatients = repository.countPatientAccountsCreatedBetween(window.start(), window.end());
        long labOrders = repository.countLabTestOrdersBetween(window.start(), window.end());
        Map<String, Long> labStatuses = repository.countLabTestOrdersByStatus(window.start(), window.end());

        LaboratoryActivityResponse laboratory = new LaboratoryActivityResponse(
                DataAvailability.PARTIAL,
                labOrders,
                statusCount(labStatuses, "REQUESTED"),
                statusCount(labStatuses, "SAMPLE_COLLECTED"),
                statusCount(labStatuses, "PROCESSING"),
                statusCount(labStatuses, "COMPLETED"),
                statusCount(labStatuses, "CANCELLED"),
                LAB_DEFINITION
        );

        HealthcareMetricAvailabilityResponse consultations = unavailable(
                "Completed Consultations", "Consultation persistence is not implemented.");
        HealthcareMetricAvailabilityResponse prescriptions = unavailable(
                "Prescriptions Issued", "Prescription persistence is not implemented.");
        HealthcareMetricAvailabilityResponse telemedicine = unavailable(
                "Telemedicine", "Telemedicine persistence is not implemented.");
        HealthcareMetricAvailabilityResponse appointmentAnalytics = unavailable(
                "Appointment Analytics", "Appointment persistence is not implemented.");
        HealthcareMetricAvailabilityResponse departmentActivity = unavailable(
                "Department Healthcare Activity", "Department persistence and department relationships are not implemented.");

        List<HealthcareMetricAvailabilityResponse> availability = List.of(
                live("Total Patients", PATIENT_DEFINITION),
                live("New Patients", PATIENT_DEFINITION + " createdAt is inside the selected period."),
                live("Patient Growth", PATIENT_DEFINITION + " Grouped by createdAt."),
                partial("Laboratory Tests", LAB_DEFINITION),
                partial("Laboratory Activity", "Uses real lab_tests order statuses for the selected period."),
                partial("Age Distribution", "Only supported, valid dateOfBirth strings are included."),
                partial("Gender Distribution", "Free-form gender values are normalized conservatively."),
                consultations,
                unavailable("Appointment Completion Rate", "Appointment persistence is not implemented."),
                prescriptions,
                appointmentAnalytics,
                departmentActivity,
                telemedicine
        );

        return new HealthcareAnalyticsResponse(
                Instant.now(),
                period,
                DataAvailability.PARTIAL,
                kpis(totalPatients, newPatients, labOrders),
                patientGrowth(window),
                laboratory,
                ageDistribution(totalPatients, now.toLocalDate()),
                genderDistribution(totalPatients),
                new ClinicalActivityResponse(DataAvailability.PARTIAL, laboratory, consultations, prescriptions, telemedicine),
                appointmentAnalytics,
                departmentActivity,
                new HealthcarePerformanceSummaryResponse(
                        DataAvailability.PARTIAL,
                        totalPatients,
                        newPatients,
                        labOrders,
                        unavailable("Department Performance", "Department persistence and department relationships are not implemented.")
                ),
                availability
        );
    }

    private List<HealthcareKpiResponse> kpis(long totalPatients, long newPatients, long labOrders) {
        return List.of(
                new HealthcareKpiResponse("Total Patients", totalPatients, DataAvailability.LIVE, PATIENT_DEFINITION, null),
                new HealthcareKpiResponse("New Patients", newPatients, DataAvailability.LIVE,
                        PATIENT_DEFINITION + " createdAt is inside the selected period.", null),
                new HealthcareKpiResponse("Completed Consultations", null, DataAvailability.UNAVAILABLE, null,
                        "Consultation persistence is not implemented."),
                new HealthcareKpiResponse("Appointment Completion Rate", null, DataAvailability.UNAVAILABLE, null,
                        "Appointment persistence is not implemented."),
                new HealthcareKpiResponse("Laboratory Tests", labOrders, DataAvailability.PARTIAL, LAB_DEFINITION, null),
                new HealthcareKpiResponse("Prescriptions Issued", null, DataAvailability.UNAVAILABLE, null,
                        "Prescription persistence is not implemented.")
        );
    }

    private List<PatientGrowthResponse> patientGrowth(PeriodWindow window) {
        Map<String, Long> counts = repository.countPatientGrowth(
                window.start(), window.end(), window.mongoFormat(), window.zone().getId());
        long cumulative = repository.countPatientAccountsCreatedBefore(window.start());
        List<PatientGrowthResponse> growth = new ArrayList<>();
        for (Bucket bucket : buckets(window)) {
            long added = counts.getOrDefault(bucket.key().toUpperCase(Locale.ROOT), 0L);
            cumulative += added;
            growth.add(new PatientGrowthResponse(bucket.label(), added, cumulative));
        }
        return growth;
    }

    private DemographicDistributionResponse ageDistribution(long totalPatients, LocalDate today) {
        long[] counts = new long[5];
        long valid = 0;
        for (String rawDob : repository.findPatientDateOfBirthValues()) {
            Optional<LocalDate> parsed = parseDateOfBirth(rawDob);
            if (parsed.isEmpty() || parsed.get().isAfter(today)) {
                continue;
            }
            int age = Period.between(parsed.get(), today).getYears();
            if (age <= 17) counts[0]++;
            else if (age <= 30) counts[1]++;
            else if (age <= 45) counts[2]++;
            else if (age <= 60) counts[3]++;
            else counts[4]++;
            valid++;
        }
        return new DemographicDistributionResponse(
                DataAvailability.PARTIAL,
                List.of(
                        new DemographicDistributionResponse.Bucket("0-17", counts[0]),
                        new DemographicDistributionResponse.Bucket("18-30", counts[1]),
                        new DemographicDistributionResponse.Bucket("31-45", counts[2]),
                        new DemographicDistributionResponse.Bucket("46-60", counts[3]),
                        new DemographicDistributionResponse.Bucket("60+", counts[4])
                ),
                totalPatients,
                valid,
                Math.max(0, totalPatients - valid),
                "Accepts ISO yyyy-MM-dd and dd/MM/yyyy values only; missing, invalid, and future dates are excluded."
        );
    }

    private DemographicDistributionResponse genderDistribution(long totalPatients) {
        Map<String, Long> raw = repository.countPatientGenderValues();
        long male = 0;
        long female = 0;
        long other = 0;
        long unknown = 0;
        for (Map.Entry<String, Long> entry : raw.entrySet()) {
            String value = entry.getKey().trim().toLowerCase(Locale.ROOT);
            switch (value) {
                case "male", "m" -> male += entry.getValue();
                case "female", "f" -> female += entry.getValue();
                case "other", "non-binary", "nonbinary" -> other += entry.getValue();
                default -> unknown += entry.getValue();
            }
        }
        long classified = male + female + other;
        long represented = classified + unknown;
        if (represented < totalPatients) {
            unknown += totalPatients - represented;
        }
        return new DemographicDistributionResponse(
                DataAvailability.PARTIAL,
                List.of(
                        new DemographicDistributionResponse.Bucket("Male", male),
                        new DemographicDistributionResponse.Bucket("Female", female),
                        new DemographicDistributionResponse.Bucket("Other", other),
                        new DemographicDistributionResponse.Bucket("Unknown", unknown)
                ),
                totalPatients,
                classified,
                unknown,
                "Gender is free-form; recognized values are normalized case-insensitively and unsupported values are Unknown."
        );
    }

    private Optional<LocalDate> parseDateOfBirth(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(java.time.format.ResolverStyle.STRICT))) {
            try {
                return Optional.of(LocalDate.parse(value.trim(), formatter));
            } catch (DateTimeParseException ignored) {
                // Try the next explicitly supported format.
            }
        }
        return Optional.empty();
    }

    private String normalizePeriod(String requestedPeriod) {
        String period = requestedPeriod == null ? "month" : requestedPeriod.trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_PERIODS.contains(period)) {
            throw new IllegalArgumentException(
                    "Invalid period '" + requestedPeriod + "'. Supported values: today, week, month, year");
        }
        return period;
    }

    private PeriodWindow periodWindow(String period, LocalDateTime now, ZoneId zone) {
        LocalDate today = now.toLocalDate();
        return switch (period) {
            case "today" -> new PeriodWindow(today.atStartOfDay(), now.plusNanos(1), "%Y-%m-%dT%H", zone, period);
            case "week" -> new PeriodWindow(
                    today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay(),
                    now.plusNanos(1), "%Y-%m-%d", zone, period);
            case "year" -> new PeriodWindow(today.withDayOfYear(1).atStartOfDay(), now.plusNanos(1), "%Y-%m", zone, period);
            default -> new PeriodWindow(today.withDayOfMonth(1).atStartOfDay(), now.plusNanos(1), "%Y-%m-%d", zone, period);
        };
    }

    private List<Bucket> buckets(PeriodWindow window) {
        List<Bucket> buckets = new ArrayList<>();
        if ("today".equals(window.period())) {
            LocalDateTime cursor = window.start();
            while (!cursor.isAfter(window.end())) {
                buckets.add(new Bucket(cursor.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH")),
                        cursor.format(DateTimeFormatter.ofPattern("HH:00"))));
                cursor = cursor.plusHours(1);
            }
        } else if ("year".equals(window.period())) {
            LocalDate cursor = window.start().toLocalDate().withDayOfMonth(1);
            LocalDate last = window.end().toLocalDate().withDayOfMonth(1);
            while (!cursor.isAfter(last)) {
                buckets.add(new Bucket(cursor.format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        cursor.format(DateTimeFormatter.ofPattern("MMM"))));
                cursor = cursor.plusMonths(1);
            }
        } else {
            LocalDate cursor = window.start().toLocalDate();
            LocalDate last = window.end().toLocalDate();
            while (!cursor.isAfter(last)) {
                buckets.add(new Bucket(cursor.toString(), cursor.format(DateTimeFormatter.ofPattern("dd MMM"))));
                cursor = cursor.plusDays(1);
            }
        }
        return buckets;
    }

    private long statusCount(Map<String, Long> statuses, String status) {
        return statuses.getOrDefault(status, 0L);
    }

    private HealthcareMetricAvailabilityResponse live(String metric, String definition) {
        return new HealthcareMetricAvailabilityResponse(metric, DataAvailability.LIVE, null, definition);
    }

    private HealthcareMetricAvailabilityResponse partial(String metric, String definition) {
        return new HealthcareMetricAvailabilityResponse(metric, DataAvailability.PARTIAL, null, definition);
    }

    private HealthcareMetricAvailabilityResponse unavailable(String metric, String reason) {
        return new HealthcareMetricAvailabilityResponse(metric, DataAvailability.UNAVAILABLE, reason, null);
    }

    private record PeriodWindow(
            LocalDateTime start,
            LocalDateTime end,
            String mongoFormat,
            ZoneId zone,
            String period
    ) {
    }

    private record Bucket(String key, String label) {
    }
}
