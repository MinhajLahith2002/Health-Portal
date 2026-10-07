package lk.gamage.backend.healthbridgebackend.repository;

import java.time.LocalDate;
import java.util.List;
import lk.gamage.backend.healthbridgebackend.model.DoctorSession;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DoctorSessionRepository extends MongoRepository<DoctorSession, String> {
    List<DoctorSession> findByDoctorIdAndSessionDate(String doctorId, LocalDate sessionDate);
    List<DoctorSession> findByDoctorIdOrderBySessionDateAscStartTimeAsc(String doctorId);
}
