package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.InsuranceMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InsuranceMessageRepository extends MongoRepository<InsuranceMessage, String> {
    long countByReceiverIdAndIsReadFalse(String receiverId);
}
