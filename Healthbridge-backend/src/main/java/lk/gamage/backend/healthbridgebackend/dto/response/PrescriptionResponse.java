package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {
    private String id;
    private String prescriptionNumber;
    private String patientId;
    private String patientName;
    private String patientPhone;
    private String doctorId;
    private String doctorName;
    private List<PrescriptionItemResponse> items;
    private String notes;
    private String diagnosis;
    private LocalDateTime validUntil;
    private String status;
    private String qrCodeData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}