package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.model.DoctorAvailability;
import lk.gamage.backend.healthbridgebackend.repository.DoctorAvailabilityRepository;
import lk.gamage.backend.healthbridgebackend.service.DoctorAvailabilityService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class DoctorAvailabilityServiceImpl implements DoctorAvailabilityService {
	private final DoctorAvailabilityRepository repository;
	public DoctorAvailabilityServiceImpl(DoctorAvailabilityRepository repository) { this.repository = repository; }
	public List<DoctorAvailability> find(String doctorId) { validateDoctorId(doctorId); return repository.findByDoctorIdOrderByDateAscStartTimeAsc(doctorId); }
	public List<DoctorAvailability> replace(String doctorId, List<DoctorAvailability> slots) {
		validateDoctorId(doctorId);
		if (slots == null) throw new BadRequestException("Availability slots are required.");
		repository.deleteByDoctorId(doctorId);
		List<DoctorAvailability> normalized = slots.stream().map(slot -> {
			if (slot.getDate() == null || slot.getDate().isBlank() || slot.getStartTime() == null || slot.getStartTime().isBlank()
					|| slot.getEndTime() == null || slot.getEndTime().isBlank() || slot.getStatus() == null || slot.getStatus().isBlank()) {
				throw new BadRequestException("Each availability slot requires date, start time, end time and status.");
			}
			if (!"Available".equalsIgnoreCase(slot.getStatus()) && !"Unavailable".equalsIgnoreCase(slot.getStatus())) {
				throw new BadRequestException("Availability status must be Available or Unavailable.");
			}
			return new DoctorAvailability("AVL-" + UUID.randomUUID(), doctorId, slot.getDate(), slot.getStartTime(), slot.getEndTime(), slot.getStatus());
		}).toList();
		return repository.saveAll(normalized);
	}
	private void validateDoctorId(String doctorId) { if (doctorId == null || doctorId.isBlank()) throw new BadRequestException("doctorId is required."); }
}
