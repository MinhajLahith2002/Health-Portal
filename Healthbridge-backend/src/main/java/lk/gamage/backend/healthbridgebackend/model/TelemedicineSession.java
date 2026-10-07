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

/**
 * Represents a single telemedicine session linked to an appointment.
 * Tracks the room lifecycle: scheduled -> waiting room -> in progress -> completed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "telemedicine_sessions")
public class TelemedicineSession {

    @Id
    private String id;

    @Indexed
    private String appointmentId;

    @Indexed
    private String patientId;

    @Indexed
    private String doctorId;

    /** Unique room code used by both parties to join the call */
    @Indexed(unique = true)
    private String roomCode;

    private ConsultationType consultationType;

    private SessionStatus status;

    private LocalDateTime scheduledStartTime;

    private LocalDateTime patientJoinedAt;

    private LocalDateTime doctorJoinedAt;

    private LocalDateTime actualStartTime;

    private LocalDateTime endTime;

    /** Duration of the actual consultation in seconds, set when the session ends */
    private Long durationInSeconds;

    private boolean screenSharingUsed;

    /** Reference to recording metadata, if the session was recorded */
    private String recordingId;

    private boolean recordingEnabled;

    /** Populated once the AI-generated summary service finishes */
    private String consultationSessionId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
