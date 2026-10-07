package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.DoctorAvailability;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DoctorAvailabilityRepository extends MongoRepository<DoctorAvailability, String> {
	List<DoctorAvailability> findByDoctorIdOrderByDateAscStartTimeAsc(String doctorId);
	void deleteByDoctorId(String doctorId);
}
