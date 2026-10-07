package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fraud_alerts")
@CompoundIndex(name = "claim_alert_type_unique", def = "{ 'claimId': 1, 'alertType': 1 }", unique = true)
public class FraudAlert {

    @Id
    private String id;                          // MongoDB ID

    @Indexed
    private String claimId;                     // Reference to insurance_claims

    @Indexed
    private String patientId;

    private String policyId;

    private String doctorId;

    // Alert details
    private String alertType;                   // DUPLICATE_CLAIM, OVERBILLING, HIGH_FREQUENCY, etc.
    private String description;                 // Detailed description of fraud suspicion

    private String severity;                    // LOW, MEDIUM, HIGH, CRITICAL

    // Risk scoring
    private Double riskScore;                   // 0-100 scale

    private Map<String, Double> riskFactors;   // {"claim_amount_anomaly": 25, "frequency": 20, etc.}

    // Status tracking
    private String status;                      // PENDING, UNDER_REVIEW, CONFIRMED_FRAUD, FALSE_POSITIVE, RESOLVED

    private String reviewedByOfficerId;

    private String reviewNotes;

    // Related entities
    private List<String> relatedAlertIds;      // Link related alerts (e.g., if multiple claims are duplicates)

    // Timestamps
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime updatedAt;

    // Additional context
    private String similarClaimId;             // If duplicate, reference to similar claim
    
    private Long flagCount;                    // How many times this patient/doctor has been flagged
}
