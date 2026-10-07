package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "beds")
public class Bed {

    @Id
    private String id;

    private String bedId; // Unique bed code/identifier e.g. "ICU-101"

    private String code; // Code e.g. "101"

    private String ward; // WardType e.g. "ICU", "General Ward", "Emergency Ward", "Cardiology", "Pediatrics", "Maternity"

    private String status; // BedStatus e.g. "Available", "Reserved", "Occupied", "Maintenance", "Cleaning"

    private String bedType; // e.g. "ICU Standard", "Electric ICU", "General Standard", etc.

    private String branchId;
    private String branchCode;

    private PatientInfo patient;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
