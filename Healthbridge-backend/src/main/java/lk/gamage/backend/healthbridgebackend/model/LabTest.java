package lk.gamage.backend.healthbridgebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "lab_tests")
public class LabTest {

    @Id
    private String id;

    private String testOrderNumber;   // auto-generated, e.g. LAB-ORD-000123
    private String patientId;
    private String doctorId;
    private String hospitalId;

    private List<String> requestedTests; // e.g. ["CBC", "Lipid Profile"]

    private TestPriority priority;       // ROUTINE, URGENT, STAT
    private TestStatus status;           // REQUESTED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED

    private boolean homeCollectionRequested;
    private String clinicalNotes;

    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;

    public enum TestPriority { ROUTINE, URGENT, STAT }
    public enum TestStatus { REQUESTED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED }
}
