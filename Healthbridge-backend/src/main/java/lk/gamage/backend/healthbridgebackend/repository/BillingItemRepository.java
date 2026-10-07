package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.BillingItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BillingItemRepository
        extends MongoRepository<BillingItem, String> {

    List<BillingItem> findByInvoiceId(String invoiceId);
}