package lk.gamage.backend.healthbridgebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "lab_results")
public class LabResult {


    @Id
    private String id;

    private String testOrderId;
    private String sampleId;
    private String patientId;

    private List<ResultParameter> parameters;

    private boolean isCritical;      // FR-LAB-007 flag
    private boolean isAbnormal;

    private String verifiedBy;       // Lab Technician who verified
    private ResultStatus status;     // DRAFT, VERIFIED, PUBLISHED

    private LocalDateTime resultedAt;
    private LocalDateTime publishedAt;

    @Data
    public static class ResultParameter {
        private String parameterName;   // e.g. "Hemoglobin"
        private String value;
        private String unit;
        private String referenceRange;  // e.g. "12-16 g/dL"
        private boolean outOfRange;
    }

    public enum ResultStatus { DRAFT, VERIFIED, PUBLISHED }
}
