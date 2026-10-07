package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);

    List<Prescription> findByPatientId(String patientId);

    List<Prescription> findByDoctorId(String doctorId);

    List<Prescription> findByPatientIdAndStatus(String patientId, String status);

    List<Prescription> findByDoctorIdAndStatus(String doctorId, String status);

    boolean existsByPrescriptionNumber(String prescriptionNumber);
}