package lk.gamage.backend.healthbridgebackend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_sessions")
@CompoundIndexes({
    @CompoundIndex(name = "doctor_date_idx", def = "{'doctorId': 1, 'sessionDate': 1}"),
    @CompoundIndex(name = "hospital_date_idx", def = "{'hospitalId': 1, 'sessionDate': 1}")
})
public class DoctorSession {
    @Id private String id;
    private String doctorId;
    private String hospitalId;
    private String hospitalName;
    private String specializationId;
    private String specializationName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int maxAppointments;
    private int bookedCount;
    private int lastIssuedAppointmentNumber;
    private int currentQueueNumber;
    private SessionStatus status;
    private String notes;
    /** "VIDEO" or "IN_PERSON". Defaults to IN_PERSON for older documents that predate this field. */
    private String appointmentType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
