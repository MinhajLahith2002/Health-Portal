package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.SupportDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SupportDocumentRepository
        extends MongoRepository<SupportDocument, String> {

    List<SupportDocument> findByCategory(String category);

        
    }