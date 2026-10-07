package lk.gamage.backend.healthbridgebackend.model;

import lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus;
import lk.gamage.backend.healthbridgebackend.enums.DoctorDecision;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
@CompoundIndexes({
    @CompoundIndex(name = "session_number_unique", def = "{'sessionId': 1, 'appointmentNumber': 1}", unique = true, sparse = true),
    @CompoundIndex(name = "session_status_idx", def = "{'sessionId': 1, 'status': 1}"),
    @CompoundIndex(name = "patient_status_idx", def = "{'patientId': 1, 'status': 1}"),
    @CompoundIndex(name = "hospital_date_idx", def = "{'hospitalId': 1, 'appointmentDate': 1}")
})
public class Appointment {
    @Id
    private String id;
    private String patientId;
    private String sessionId;
    private String doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String hospital;
    private String hospitalId;
    @Indexed(unique = true, sparse = true)
    private String referenceNumber;
    private Integer appointmentNumber;
    @Indexed(unique = true, sparse = true)
    private String activeBookingKey;
    private String patientName;
    private String patientPhone;
    private String patientNicOrPassport;
    private String patientEmail;
    private String patientAddress;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private String appointmentType;
    private String reason;
    private AppointmentStatus status;
    private DoctorDecision doctorDecision;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Appointment() { }

    public Appointment(String id, String patientId, String doctorId, String doctorName,
                       String doctorSpecialization, String hospital, LocalDate appointmentDate,
                       String appointmentTime, String appointmentType, String reason) {
        this.id = id; this.patientId = patientId; this.doctorId = doctorId;
        this.doctorName = doctorName; this.doctorSpecialization = doctorSpecialization;
        this.hospital = hospital; this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime; this.appointmentType = appointmentType;
        this.reason = reason; this.status = AppointmentStatus.UPCOMING;
        this.doctorDecision = DoctorDecision.PENDING;
        this.createdAt = LocalDateTime.now(); this.updatedAt = this.createdAt;
    }

    public String getId() { return id; } public void setId(String v) { id = v; }
    public String getPatientId() { return patientId; } public void setPatientId(String v) { patientId = v; }
    public String getSessionId() { return sessionId; } public void setSessionId(String v) { sessionId = v; }
    public String getDoctorId() { return doctorId; } public void setDoctorId(String v) { doctorId = v; }
    public String getDoctorName() { return doctorName; } public void setDoctorName(String v) { doctorName = v; }
    public String getDoctorSpecialization() { return doctorSpecialization; } public void setDoctorSpecialization(String v) { doctorSpecialization = v; }
    public String getHospital() { return hospital; } public void setHospital(String v) { hospital = v; }
    public String getHospitalId() { return hospitalId; } public void setHospitalId(String v) { hospitalId = v; }
    public String getReferenceNumber() { return referenceNumber; } public void setReferenceNumber(String v) { referenceNumber = v; }
    public Integer getAppointmentNumber() { return appointmentNumber; } public void setAppointmentNumber(Integer v) { appointmentNumber = v; }
    public String getActiveBookingKey() { return activeBookingKey; } public void setActiveBookingKey(String v) { activeBookingKey = v; }
    public String getPatientName() { return patientName; } public void setPatientName(String v) { patientName = v; }
    public String getPatientPhone() { return patientPhone; } public void setPatientPhone(String v) { patientPhone = v; }
    public String getPatientNicOrPassport() { return patientNicOrPassport; } public void setPatientNicOrPassport(String v) { patientNicOrPassport = v; }
    public String getPatientEmail() { return patientEmail; } public void setPatientEmail(String v) { patientEmail = v; }
    public String getPatientAddress() { return patientAddress; } public void setPatientAddress(String v) { patientAddress = v; }
    public LocalDate getAppointmentDate() { return appointmentDate; } public void setAppointmentDate(LocalDate v) { appointmentDate = v; }
    public String getAppointmentTime() { return appointmentTime; } public void setAppointmentTime(String v) { appointmentTime = v; }
    public String getAppointmentType() { return appointmentType; } public void setAppointmentType(String v) { appointmentType = v; }
    public String getReason() { return reason; } public void setReason(String v) { reason = v; }
    public AppointmentStatus getStatus() { return status; } public void setStatus(AppointmentStatus v) { status = v; }
    public DoctorDecision getDoctorDecision() { return doctorDecision; } public void setDoctorDecision(DoctorDecision v) { doctorDecision = v; }
    public String getCancellationReason() { return cancellationReason; } public void setCancellationReason(String v) { cancellationReason = v; }
    public LocalDateTime getCancelledAt() { return cancelledAt; } public void setCancelledAt(LocalDateTime v) { cancelledAt = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { createdAt = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime v) { updatedAt = v; }
}
