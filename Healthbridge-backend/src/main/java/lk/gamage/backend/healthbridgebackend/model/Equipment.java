package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "equipment")
public class Equipment {

    @Id
    private String id;
    private String assetId;
    private String name;
    private String category; // Life Support, Diagnostic, Monitoring, Surgical, etc.
    private String department; // ICU, ER, Radiology, Surgery, Biomed Workshop
    private String location; // e.g. ICU - Bed 04
    private String serialNo;
    private String status; // In Use, Available, Maintenance, Calibration Due
    private String calibrationDueDate; // e.g. Aug 15, 2026 or 2026-08-15
    private String model; // e.g. X200
    private String supplier; // e.g. MedTech Corp
    private String purchaseDate; // e.g. Jan 12, 2024
    private String warrantyExpiry; // e.g. Dec 31, 2026
    private Integer depreciationPercentage; // e.g. 82
    private Double initialValue; // e.g. 45000.0
    private Double currentValue; // e.g. 36900.0
    private String alertMessage; // e.g. Low Stock: O2 Sensors (2 units remaining)

    private String branchId;
    private String branchCode;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
