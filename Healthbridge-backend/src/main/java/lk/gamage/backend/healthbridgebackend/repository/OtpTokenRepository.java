package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.OtpToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends MongoRepository<OtpToken, String> {
    Optional<OtpToken> findTopByEmailIgnoreCaseAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<OtpToken> findByEmailIgnoreCaseAndOtpAndUsedFalse(String email, String otp);
    List<OtpToken> findAllByEmailIgnoreCaseAndUsedFalse(String email);
}

