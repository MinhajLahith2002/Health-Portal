package lk.gamage.backend.healthbridgebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "lab_samples")
public class LabSample {

    @Id
    private String id;

    private String testOrderId;      // references LabTest
    private String barcodeId;        // scanned via HW-005 barcode scanner
    private String sampleType;       // Blood, Urine, Swab, etc.

    private String collectedBy;      // Lab Technician ID
    private String collectionLocation; // "Lab" or "Home"

    private SampleStatus status;     // PENDING, COLLECTED, IN_TRANSIT, RECEIVED, REJECTED

    private LocalDateTime collectedAt;
    private LocalDateTime receivedAt;
    private String rejectionReason;  // if status = REJECTED

    public enum SampleStatus { PENDING, COLLECTED, IN_TRANSIT, RECEIVED, REJECTED }
}
