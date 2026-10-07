package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.DoctorAvailability;
import java.util.List;

public interface DoctorAvailabilityService {
	List<DoctorAvailability> find(String doctorId);
	List<DoctorAvailability> replace(String doctorId, List<DoctorAvailability> slots);
}
