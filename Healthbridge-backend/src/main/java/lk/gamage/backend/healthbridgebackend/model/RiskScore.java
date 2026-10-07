package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "risk_scores")
public class RiskScore {

    @Id
    private String id;

    // Entity being scored
    @Indexed(unique = true)
    private String patientId;

    @Indexed
    private String doctorId;

    @Indexed
    private String policyId;

    // Overall scores (0-100)
    private Double patientRiskScore;            // Patient's overall fraud risk

    private Double doctorRiskScore;             // Doctor's overall risk

    private Double claimRiskScore;              // Individual claim risk

    // Component scores (0-100)
    private Double claimAmountScore;            // Based on amount anomalies

    private Double frequencyScore;              // Based on claim frequency

    private Double doctorReputationScore;       // Based on doctor's history

    private Double documentationScore;          // Based on document quality/completeness

    private Double medicalLogicScore;           // Based on medical consistency

    // Historical data for trending
    private Integer totalClaimsLastYear;

    private Integer rejectedClaimsLastYear;

    private Double averageClaimAmountLastYear;

    private Double stdDeviationClaimAmount;     // For anomaly detection

    @Indexed
    private Integer flaggedClaimsCount;         // Number of fraud alerts for this entity

    private Integer confirmedFraudCount;        // Confirmed fraudulent claims

    private Integer falsePositiveCount;         // Alerts that were false positives

    // Risk trend
    private String riskTrend;                   // INCREASING, STABLE, DECREASING

    private Double previousRiskScore;           // For trend comparison

    // Timestamps
    private LocalDateTime calculatedAt;

    private LocalDateTime lastUpdated;

    private LocalDateTime nextCalculationAt;   // When to recalculate

    // Additional metadata
    private Boolean isActive;                   // Whether this score is still being monitored

    private String notes;                       // Additional notes from reviewers
}
