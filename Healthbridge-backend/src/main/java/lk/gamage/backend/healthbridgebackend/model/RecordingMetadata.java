package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Metadata about a recorded consultation. The actual media file is stored in
 * object storage (e.g. S3/GCS); only the reference and metadata live here.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingMetadata {
    private String storageUrl;
    private String fileFormat;
    private Long fileSizeBytes;
    private Long durationInSeconds;
    private LocalDateTime recordedAt;
    private boolean consentGivenByPatient;
    private boolean consentGivenByDoctor;
}
