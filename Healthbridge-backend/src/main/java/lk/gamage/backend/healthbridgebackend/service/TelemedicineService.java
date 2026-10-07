package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.*;

import java.util.List;

public interface TelemedicineService {

    SessionResponse createSession(CreateSessionRequest request);

    SessionResponse enterWaitingRoom(String sessionId, JoinSessionRequest request);

    SessionResponse joinSession(String sessionId, JoinSessionRequest request);

    SessionResponse getSession(String sessionId);

    SessionResponse getSessionByRoomCode(String roomCode);

    SessionResponse getSessionByAppointmentId(String appointmentId);

    SessionResponse endSession(String sessionId, EndSessionRequest request);

    SessionResponse cancelSession(String sessionId, String reason);

    ConsultationSummaryResponse getSummary(String sessionId);

    List<SessionHistoryItem> getHistoryForPatient(String patientId);

    List<SessionHistoryItem> getHistoryForDoctor(String doctorId);

    void markScreenSharingUsed(String sessionId);

    void attachRecording(String sessionId, RecordingMetadataRequest request);
}