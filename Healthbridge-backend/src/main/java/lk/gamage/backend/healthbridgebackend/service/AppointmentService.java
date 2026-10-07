package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.AppointmentBookingRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.AppointmentBookingResponse;
import lk.gamage.backend.healthbridgebackend.model.Appointment;
import java.util.List;

public interface AppointmentService {
    AppointmentBookingResponse book(String patientId, AppointmentBookingRequest request);
    List<AppointmentBookingResponse> findMine(String patientId);
    AppointmentBookingResponse findOwned(String id, String userId, String role);
    AppointmentBookingResponse cancel(String id, String patientId, String reason);
    AppointmentBookingResponse reschedule(String id, String patientId, String targetSessionId);
    List<AppointmentBookingResponse> queue(String sessionId, String doctorId);
    AppointmentBookingResponse updateQueueAppointment(String id, String doctorId, String status);
    Appointment raw(String id);
}
