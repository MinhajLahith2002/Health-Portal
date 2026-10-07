package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.SOSAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSRepository extends MongoRepository<SOSAlert, String> {
    List<SOSAlert> findByUserId(String userId);
    List<SOSAlert> findByStatus(String status);
}
