package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.repository.PopulationHealthAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.service.PopulationHealthAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PopulationHealthAnalyticsServiceImpl implements PopulationHealthAnalyticsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");
    private static final Set<String> VALID_BLOOD_GROUPS = Set.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");
    private static final String PATIENT_DEFINITION = "Registered patient accounts are User documents where role = PATIENT; this is not every clinical patient.";

    private final PopulationHealthAnalyticsReadRepository repository;

    @Override
    public PopulationHealthAnalyticsResponse getPopulationHealthAnalytics(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime now = LocalDateTime.now(zone);
        PeriodWindow window = periodWindow(period, now, zone);

        long totalPatients = repository.countPatientAccounts();
        long newPatients = repository.countNewPatientAccounts(window.start(), window.end());
        AgeDistributionResponse age = ageDistribution(totalPatients, now.toLocalDate());
        GenderDistributionResponse gender = genderDistribution(totalPatients);
        BloodGroupDistributionResponse bloodGroup = bloodGroupDistribution(totalPatients);
        PopulationHealthAnalyticsReadRepository.LabIndicatorData labData =
                repository.summarizePublishedLabResults(window.start(), window.end());
        LabHealthIndicatorResponse lab = labIndicators(labData);

        PopulationMetricAvailabilityResponse commonConditions = unavailable(
                "Common Conditions", "Normalized diagnosis/condition persistence is not implemented.");
        PopulationMetricAvailabilityResponse healthRisk = unavailable(
                "Health Risk Distribution", "No validated health-risk scoring model or persisted risk source exists.");
        PopulationMetricAvailabilityResponse utilization = unavailable(
                "Healthcare Utilization By Age", "Appointment and clinical encounter persistence is not implemented.");
        PopulationMetricAvailabilityResponse regions = unavailable(
                "Regional Health Patterns", "User addresses are unstructured and no normalized geographic fields exist.");
        PopulationMetricAvailabilityResponse preventiveCare = unavailable(
                "Preventive Care Trends", "Vaccination, screening, and preventive-care persistence is not implemented.");

        return new PopulationHealthAnalyticsResponse(
                Instant.now(),
                period,
                DataAvailability.PARTIAL,
                kpis(totalPatients, newPatients, labData),
                populationGrowth(window),
                age,
                gender,
                bloodGroup,
                lab,
                commonConditions,
                healthRisk,
                utilization,
                regions,
                preventiveCare,
                new PopulationHealthSummaryResponse(
                        DataAvailability.PARTIAL,
                        totalPatients,
                        newPatients,
                        age.validRecords(),
                        gender.validRecords(),
                        bloodGroup.validRecords(),
                        labData.publishedResults(),
                        labData.abnormalResults(),
                        labData.criticalResults(),
                        "Summary covers registered-account demographics and laboratory results only; it is not clinical population prevalence."
                ),
                List.of(
                        live("Registered Patient Accounts", PATIENT_DEFINITION),
                        live("New Patient Accounts", PATIENT_DEFINITION + " createdAt is inside the selected period."),
                        live("Population Growth", PATIENT_DEFINITION + " Grouped by createdAt."),
                        partial("Age Distribution", "Coverage is limited by valid supported dateOfBirth strings."),
                        partial("Gender Distribution", "Coverage is limited by normalized free-form gender values."),
                        partial("Blood Group Distribution", "Coverage is limited to recognized blood-group values."),
                        partial("Lab Health Indicators", "Indicators cover published lab results in the period, not the registered population."),
                        commonConditions,
                        healthRisk,
                        utilization,
                        regions,
                        preventiveCare
                )
        );
    }

    private List<PopulationHealthKpiResponse> kpis(
            long totalPatients,
            long newPatients,
            PopulationHealthAnalyticsReadRepository.LabIndicatorData lab
    ) {
        return List.of(
                new PopulationHealthKpiResponse("Registered Patient Accounts", totalPatients, DataAvailability.LIVE, PATIENT_DEFINITION, null),
                new PopulationHealthKpiResponse("New Patient Accounts", newPatients, DataAvailability.LIVE,
                        PATIENT_DEFINITION + " createdAt is inside the selected period.", null),
                new PopulationHealthKpiResponse("Published Lab Results", lab.publishedResults(), DataAvailability.PARTIAL,
                        "Count of PUBLISHED lab results by publishedAt in the selected period.",
                        "Lab-tested users are not the entire registered population."),
                new PopulationHealthKpiResponse("Abnormal Lab Results", lab.abnormalResults(), DataAvailability.PARTIAL,
                        "Count of selected published lab results where isAbnormal is true.",
                        "This is not disease prevalence."),
                new PopulationHealthKpiResponse("Critical Lab Results", lab.criticalResults(), DataAvailability.PARTIAL,
                        "Count of selected published lab results where isCritical is true.",
                        "This is not a population health-risk score."),
                new PopulationHealthKpiResponse("Common Conditions", null, DataAvailability.UNAVAILABLE, null,
                        "Normalized diagnosis/condition persistence is not implemented."),
                new PopulationHealthKpiResponse("Health Risk", null, DataAvailability.UNAVAILABLE, null,
                        "No validated health-risk scoring model or persisted risk source exists.")
        );
    }

    private List<PopulationGrowthResponse> populationGrowth(PeriodWindow window) {
        Map<String, Long> counts = repository.countPopulationGrowth(
                window.start(), window.end(), window.mongoFormat(), window.zone().getId());
        long cumulative = repository.countPatientAccountsBefore(window.start());
        List<PopulationGrowthResponse> result = new ArrayList<>();
        for (Bucket bucket : buckets(window)) {
            long added = counts.getOrDefault(bucket.key(), 0L);
            cumulative += added;
            result.add(new PopulationGrowthResponse(bucket.label(), added, cumulative));
        }
        return result;
    }

    private AgeDistributionResponse ageDistribution(long totalPatients, LocalDate today) {
        long[] counts = new long[5];
        long valid = 0;
        for (String rawDob : repository.findPatientDateOfBirthValues()) {
            Optional<LocalDate> parsed = parseDateOfBirth(rawDob);
            if (parsed.isEmpty() || parsed.get().isAfter(today)) continue;
            int age = Period.between(parsed.get(), today).getYears();
            if (age <= 17) counts[0]++;
            else if (age <= 30) counts[1]++;
            else if (age <= 45) counts[2]++;
            else if (age <= 60) counts[3]++;
            else counts[4]++;
            valid++;
        }
        return new AgeDistributionResponse(
                DataAvailability.PARTIAL,
                List.of(
                        new AgeDistributionResponse.Bucket("0-17", counts[0]),
                        new AgeDistributionResponse.Bucket("18-30", counts[1]),
                        new AgeDistributionResponse.Bucket("31-45", counts[2]),
                        new AgeDistributionResponse.Bucket("46-60", counts[3]),
                        new AgeDistributionResponse.Bucket("60+", counts[4])
                ),
                totalPatients,
                valid,
                Math.max(0, totalPatients - valid),
                "Accepts strict yyyy-MM-dd and dd/MM/yyyy only; null, blank, invalid, and future dates are excluded."
        );
    }

    private GenderDistributionResponse genderDistribution(long totalPatients) {
        long male = 0, female = 0, other = 0, unknown = 0;
        for (Map.Entry<String, Long> entry : repository.countGenderValues().entrySet()) {
            String value = entry.getKey().trim().toLowerCase(Locale.ROOT);
            switch (value) {
                case "male", "m" -> male += entry.getValue();
                case "female", "f" -> female += entry.getValue();
                case "other", "non-binary", "nonbinary" -> other += entry.getValue();
                default -> unknown += entry.getValue();
            }
        }
        long valid = male + female + other;
        if (valid + unknown < totalPatients) unknown += totalPatients - valid - unknown;
        return new GenderDistributionResponse(
                DataAvailability.PARTIAL,
                List.of(
                        new GenderDistributionResponse.Bucket("Male", male),
                        new GenderDistributionResponse.Bucket("Female", female),
                        new GenderDistributionResponse.Bucket("Other", other),
                        new GenderDistributionResponse.Bucket("Unknown", unknown)
                ),
                totalPatients, valid, unknown,
                "Recognized values are normalized case-insensitively; missing and unsupported values are Unknown."
        );
    }

    private BloodGroupDistributionResponse bloodGroupDistribution(long totalPatients) {
        Map<String, Long> normalized = new LinkedHashMap<>();
        for (String group : List.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")) normalized.put(group, 0L);
        long unknown = 0;
        for (Map.Entry<String, Long> entry : repository.countBloodGroupValues().entrySet()) {
            String value = entry.getKey().replaceAll("\\s+", "").toUpperCase(Locale.ROOT);
            if (VALID_BLOOD_GROUPS.contains(value)) normalized.merge(value, entry.getValue(), Long::sum);
            else unknown += entry.getValue();
        }
        long valid = normalized.values().stream().mapToLong(Long::longValue).sum();
        if (valid + unknown < totalPatients) unknown += totalPatients - valid - unknown;
        List<BloodGroupDistributionResponse.Bucket> buckets = new ArrayList<>();
        normalized.forEach((group, count) -> buckets.add(new BloodGroupDistributionResponse.Bucket(group, count)));
        buckets.add(new BloodGroupDistributionResponse.Bucket("Unknown", unknown));
        return new BloodGroupDistributionResponse(
                DataAvailability.PARTIAL, List.copyOf(buckets), totalPatients, valid, unknown,
                "Whitespace and case are normalized; only A+, A-, B+, B-, AB+, AB-, O+, and O- are recognized."
        );
    }

    private LabHealthIndicatorResponse labIndicators(PopulationHealthAnalyticsReadRepository.LabIndicatorData data) {
        return new LabHealthIndicatorResponse(
                DataAvailability.PARTIAL,
                data.publishedResults(),
                data.abnormalResults(),
                data.criticalResults(),
                percentage(data.abnormalResults(), data.publishedResults()),
                percentage(data.criticalResults(), data.publishedResults()),
                "Published lab results in the selected period.",
                "These indicators describe lab results among tested users, not disease prevalence or risk across all registered accounts."
        );
    }

    private Optional<LocalDate> parseDateOfBirth(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT))) {
            try {
                return Optional.of(LocalDate.parse(value.trim(), formatter));
            } catch (DateTimeParseException ignored) {
                // Try the next explicitly supported format.
            }
        }
        return Optional.empty();
    }

    private BigDecimal percentage(long numerator, long denominator) {
        if (denominator == 0) return BigDecimal.ZERO.setScale(2);
        return BigDecimal.valueOf(numerator).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
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
            case "week" -> new PeriodWindow(today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay(),
                    now.plusNanos(1), "%Y-%m-%d", zone, period);
            case "year" -> new PeriodWindow(today.withDayOfYear(1).atStartOfDay(), now.plusNanos(1), "%Y-%m", zone, period);
            default -> new PeriodWindow(today.withDayOfMonth(1).atStartOfDay(), now.plusNanos(1), "%Y-%m-%d", zone, period);
        };
    }

    private List<Bucket> buckets(PeriodWindow window) {
        List<Bucket> result = new ArrayList<>();
        if ("today".equals(window.period())) {
            LocalDateTime cursor = window.start();
            while (!cursor.isAfter(window.end())) {
                result.add(new Bucket(cursor.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH")),
                        cursor.format(DateTimeFormatter.ofPattern("HH:00"))));
                cursor = cursor.plusHours(1);
            }
        } else if ("year".equals(window.period())) {
            LocalDate cursor = window.start().toLocalDate().withDayOfMonth(1);
            LocalDate last = window.end().toLocalDate().withDayOfMonth(1);
            while (!cursor.isAfter(last)) {
                result.add(new Bucket(cursor.format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        cursor.format(DateTimeFormatter.ofPattern("MMM"))));
                cursor = cursor.plusMonths(1);
            }
        } else {
            LocalDate cursor = window.start().toLocalDate();
            LocalDate last = window.end().toLocalDate();
            while (!cursor.isAfter(last)) {
                result.add(new Bucket(cursor.toString(), cursor.format(DateTimeFormatter.ofPattern("dd MMM"))));
                cursor = cursor.plusDays(1);
            }
        }
        return result;
    }

    private PopulationMetricAvailabilityResponse live(String metric, String definition) {
        return new PopulationMetricAvailabilityResponse(metric, DataAvailability.LIVE, null, definition);
    }

    private PopulationMetricAvailabilityResponse partial(String metric, String reason) {
        return new PopulationMetricAvailabilityResponse(metric, DataAvailability.PARTIAL, reason, null);
    }

    private PopulationMetricAvailabilityResponse unavailable(String metric, String reason) {
        return new PopulationMetricAvailabilityResponse(metric, DataAvailability.UNAVAILABLE, reason, null);
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
