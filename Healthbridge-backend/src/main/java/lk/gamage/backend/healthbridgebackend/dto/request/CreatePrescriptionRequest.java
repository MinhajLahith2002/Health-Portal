package lk.gamage.backend.healthbridgebackend.dto.request;

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
public class CreatePrescriptionRequest {
    private String patientId;
    private String patientName;
    private String patientPhone;
    private String doctorId;
    private String doctorName;
    private List<PrescriptionItemRequest> items;
    private String notes;
    private String diagnosis;
    private int validDays;
}