package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(String userId);
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}