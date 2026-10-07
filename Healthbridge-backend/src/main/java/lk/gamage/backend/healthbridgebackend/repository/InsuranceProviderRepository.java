package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.InsuranceProvider;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuranceProviderRepository extends MongoRepository<InsuranceProvider, String> {
    Optional<InsuranceProvider> findByProviderId(String providerId);
}
