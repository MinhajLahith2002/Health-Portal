package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.service.TelemedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/telemedicine")
@RequiredArgsConstructor
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse createSession(@Valid @RequestBody CreateSessionRequest request) {
        return telemedicineService.createSession(request);
    }

    @GetMapping("/sessions/{sessionId}")
    public SessionResponse getSession(@PathVariable String sessionId) {
        return telemedicineService.getSession(sessionId);
    }

    @GetMapping("/sessions/by-room/{roomCode}")
    public SessionResponse getSessionByRoomCode(@PathVariable String roomCode) {
        return telemedicineService.getSessionByRoomCode(roomCode);
    }

    @GetMapping("/sessions/by-appointment/{appointmentId}")
    public SessionResponse getSessionByAppointmentId(@PathVariable String appointmentId) {
        return telemedicineService.getSessionByAppointmentId(appointmentId);
    }

    @PostMapping("/sessions/{sessionId}/waiting-room")
    public SessionResponse enterWaitingRoom(
            @PathVariable String sessionId,
            @Valid @RequestBody JoinSessionRequest request) {
        return telemedicineService.enterWaitingRoom(sessionId, request);
    }

    @PostMapping("/sessions/{sessionId}/join")
    public SessionResponse joinSession(
            @PathVariable String sessionId,
            @Valid @RequestBody JoinSessionRequest request) {
        return telemedicineService.joinSession(sessionId, request);
    }

    @PostMapping("/sessions/{sessionId}/end")
    public SessionResponse endSession(
            @PathVariable String sessionId,
            @RequestBody EndSessionRequest request) {
        return telemedicineService.endSession(sessionId, request);
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    public SessionResponse cancelSession(
            @PathVariable String sessionId,
            @RequestParam(required = false) String reason) {
        return telemedicineService.cancelSession(sessionId, reason);
    }

    @PostMapping("/sessions/{sessionId}/screen-share")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markScreenSharingUsed(@PathVariable String sessionId) {
        telemedicineService.markScreenSharingUsed(sessionId);
    }

    @PostMapping("/sessions/{sessionId}/recording")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void attachRecording(
            @PathVariable String sessionId,
            @Valid @RequestBody RecordingMetadataRequest request) {
        telemedicineService.attachRecording(sessionId, request);
    }

    @GetMapping("/sessions/{sessionId}/summary")
    public ConsultationSummaryResponse getSummary(@PathVariable String sessionId) {
        return telemedicineService.getSummary(sessionId);
    }

    @GetMapping("/patients/{patientId}/history")
    public List<SessionHistoryItem> getPatientHistory(@PathVariable String patientId) {
        return telemedicineService.getHistoryForPatient(patientId);
    }

    @GetMapping("/doctors/{doctorId}/history")
    public List<SessionHistoryItem> getDoctorHistory(@PathVariable String doctorId) {
        return telemedicineService.getHistoryForDoctor(doctorId);
    }

    @ExceptionHandler(lk.gamage.backend.healthbridgebackend.service.TelemedicineSessionNotFoundException.class)
    public ResponseEntity<String> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(lk.gamage.backend.healthbridgebackend.service.InvalidSessionStateException.class)
    public ResponseEntity<String> handleInvalidState(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}