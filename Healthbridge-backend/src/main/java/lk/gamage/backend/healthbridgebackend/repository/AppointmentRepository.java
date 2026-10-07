package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Appointment;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(String patientId);
    List<Appointment> findBySessionIdOrderByAppointmentNumberAsc(String sessionId);
    Optional<Appointment> findByReferenceNumber(String referenceNumber);
    boolean existsBySessionIdAndPatientIdAndStatusIn(String sessionId, String patientId,
            List<lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus> statuses);
    List<Appointment> findByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(
            String doctorId, java.time.LocalDate date, String time,
            lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus status);

    default boolean existsByDoctorAndSlot(String doctorId, java.time.LocalDate date, String time, String ignoredId) {
        return findAll().stream().anyMatch(a -> !a.getId().equals(ignoredId)
            && doctorId.equals(a.getDoctorId()) && date.equals(a.getAppointmentDate())
            && time.equals(a.getAppointmentTime())
            && a.getStatus() == lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus.UPCOMING);
    }
}
