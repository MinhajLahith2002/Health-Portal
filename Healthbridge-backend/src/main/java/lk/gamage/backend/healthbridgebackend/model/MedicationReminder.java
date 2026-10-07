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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medication_reminders")
public class MedicationReminder {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String prescriptionId;

    private String medicineName;
    private String dosage;
    private String instructions; 

    private LocalDate scheduledDate;
    private LocalTime scheduledTime; 

    private String status; // PENDING, TAKEN, SKIPPED
    private LocalDateTime actionTakenAt; 

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
