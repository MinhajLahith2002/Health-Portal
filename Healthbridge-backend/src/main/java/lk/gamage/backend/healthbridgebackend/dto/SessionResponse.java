package lk.gamage.backend.healthbridgebackend.dto;

import lk.gamage.backend.healthbridgebackend.model.ConsultationType;
import lk.gamage.backend.healthbridgebackend.model.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private String id;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String roomCode;
    private ConsultationType consultationType;
    private SessionStatus status;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime endTime;
    private Long durationInSeconds;
    private boolean recordingEnabled;
    /** WebSocket signaling URL the frontend should connect to for WebRTC handshake */
    private String signalingUrl;
}
