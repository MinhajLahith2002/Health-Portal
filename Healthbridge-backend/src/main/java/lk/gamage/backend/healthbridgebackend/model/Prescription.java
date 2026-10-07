package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prescriptions")
public class Prescription {

    @Id
    private String id;

    @Indexed(unique = true)
    private String prescriptionNumber;

    private String patientId;
    private String patientName;
    private String patientPhone;

    private String doctorId;
    private String doctorName;

    private List<PrescriptionItem> items;

    private String notes;
    private String diagnosis;

    private LocalDateTime validUntil;

    private String status; // ACTIVE, COMPLETED, CANCELLED

    private String qrCodeData;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}