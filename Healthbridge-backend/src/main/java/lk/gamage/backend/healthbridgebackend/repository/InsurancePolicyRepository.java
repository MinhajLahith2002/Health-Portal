package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.InsurancePolicy;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InsurancePolicyRepository extends MongoRepository<InsurancePolicy, String> {
    Optional<InsurancePolicy> findByPolicyNumber(String policyNumber);
    List<InsurancePolicy> findByPatientId(String patientId);
    boolean existsByPolicyNumber(String policyNumber);
}