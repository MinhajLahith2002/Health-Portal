package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.SessionStatus;
import lk.gamage.backend.healthbridgebackend.model.TelemedicineSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TelemedicineSessionRepository extends MongoRepository<TelemedicineSession, String> {

    Optional<TelemedicineSession> findByRoomCode(String roomCode);

    Optional<TelemedicineSession> findByAppointmentId(String appointmentId);

    /** Tolerates duplicate rows for one appointment (findBy... would throw IncorrectResultSizeDataAccessException). */
    Optional<TelemedicineSession> findFirstByAppointmentId(String appointmentId);

    List<TelemedicineSession> findByPatientIdOrderByScheduledStartTimeDesc(String patientId);

    List<TelemedicineSession> findByDoctorIdOrderByScheduledStartTimeDesc(String doctorId);

    List<TelemedicineSession> findByPatientIdAndStatus(String patientId, SessionStatus status);

    List<TelemedicineSession> findByDoctorIdAndStatus(String doctorId, SessionStatus status);
}