package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
	List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

	long countByRecipientIdAndReadFalse(String recipientId);
}
