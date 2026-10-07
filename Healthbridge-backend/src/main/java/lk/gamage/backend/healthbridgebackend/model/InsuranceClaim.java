package lk.gamage.backend.healthbridgebackend.model;

import lk.gamage.backend.healthbridgebackend.enums.ClaimStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "insurance_claims")
public class InsuranceClaim {

    @Id
    private String id;

    @Indexed(unique = true)
    private String claimNumber;        // generated, e.g. CLM-2026-000123

    private String policyId;
    private String patientId;

    private String treatmentDescription;
    private String hospitalName;
    private String branch;
    private Double claimAmount;
    private Double approvedAmount;

    private List<String> documentUrls;     // Cloudinary secure URLs
    private List<String> documentPublicIds;  // Cloudinary public IDs
    private List<String> documentFileIds;  // Legacy GridFS file ids (if any)

    private ClaimStatus status;

    private String reviewedByOfficerId;
    private String rejectionReason;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime updatedAt;
}