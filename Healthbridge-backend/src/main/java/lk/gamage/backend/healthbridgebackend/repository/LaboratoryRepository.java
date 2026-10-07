package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Laboratory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LaboratoryRepository extends MongoRepository<Laboratory, String> {
    Optional<Laboratory> findByLabId(String labId);
}
