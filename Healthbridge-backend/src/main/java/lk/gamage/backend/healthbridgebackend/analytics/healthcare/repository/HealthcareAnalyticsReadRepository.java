package lk.gamage.backend.healthbridgebackend.analytics.healthcare.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface HealthcareAnalyticsReadRepository {

    long countPatientAccounts();

    long countPatientAccountsCreatedBetween(LocalDateTime start, LocalDateTime end);

    long countPatientAccountsCreatedBefore(LocalDateTime end);

    Map<String, Long> countPatientGrowth(
            LocalDateTime start,
            LocalDateTime end,
            String mongoDateFormat,
            String timezone
    );

    long countLabTestOrdersBetween(LocalDateTime start, LocalDateTime end);

    Map<String, Long> countLabTestOrdersByStatus(LocalDateTime start, LocalDateTime end);

    List<String> findPatientDateOfBirthValues();

    Map<String, Long> countPatientGenderValues();
}
