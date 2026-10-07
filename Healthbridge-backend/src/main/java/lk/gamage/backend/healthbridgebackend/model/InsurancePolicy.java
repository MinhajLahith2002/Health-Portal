package lk.gamage.backend.healthbridgebackend.model;

import lk.gamage.backend.healthbridgebackend.enums.PolicyStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "insurance_policies")
public class InsurancePolicy {

    @Id
    private String id;

    @Indexed(unique = true)
    private String policyNumber;

    private String patientId;          // ref User._id
    private String providerName;       // e.g. "Ceylinco Life"
    private String policyType;         // e.g. "Health", "Family Floater"

    private Double coverageAmount;     // total coverage limit
    private Double coverageUsed;       // running total of approved claims

    private LocalDate startDate;
    private LocalDate endDate;

    private PolicyStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}