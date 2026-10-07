package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecordingMetadataRequest {

    @NotBlank(message = "storageUrl is required")
    private String storageUrl;

    private String fileFormat;
    private Long fileSizeBytes;
    private Long durationInSeconds;
    private boolean consentGivenByPatient;
    private boolean consentGivenByDoctor;
}
