package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertResponse {
    
    private String id;
    private String claimId;
    private String patientId;
    private String policyId;
    private String doctorId;
    
    private String alertType;
    private String description;
    private String severity;
    
    private Double riskScore;
    private Map<String, Double> riskFactors;
    
    private String status;
    private String reviewedByOfficerId;
    private String reviewNotes;
    
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime updatedAt;
}
