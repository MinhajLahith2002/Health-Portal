package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<Payment> findByPatientId(String patientId);

    List<Payment> findByStatus(String status);

    Optional<Payment> findByIdAndPatientId(String id, String patientId);
}