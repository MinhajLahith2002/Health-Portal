package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface PopulationHealthAnalyticsReadRepository {

    long countPatientAccounts();

    long countNewPatientAccounts(LocalDateTime start, LocalDateTime end);

    long countPatientAccountsBefore(LocalDateTime end);

    Map<String, Long> countPopulationGrowth(
            LocalDateTime start,
            LocalDateTime end,
            String mongoDateFormat,
            String timezone
    );

    List<String> findPatientDateOfBirthValues();

    Map<String, Long> countGenderValues();

    Map<String, Long> countBloodGroupValues();

    LabIndicatorData summarizePublishedLabResults(LocalDateTime start, LocalDateTime end);

    record LabIndicatorData(long publishedResults, long abnormalResults, long criticalResults) {
    }
}
