package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class MedicationReminderResponse {
    private String id;
    private String prescriptionId;
    private String medicineName;
    private String dosage;
    private String instructions;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private String status;
}
