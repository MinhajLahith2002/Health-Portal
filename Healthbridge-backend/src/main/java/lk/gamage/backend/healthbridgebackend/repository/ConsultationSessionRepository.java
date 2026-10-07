package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.ConsultationSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ConsultationSessionRepository extends MongoRepository<ConsultationSession, String> {

    Optional<ConsultationSession> findByTelemedicineSessionId(String telemedicineSessionId);
}
