package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.NotificationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {
    List<NotificationLog> findByAlertId(String alertId);
}
