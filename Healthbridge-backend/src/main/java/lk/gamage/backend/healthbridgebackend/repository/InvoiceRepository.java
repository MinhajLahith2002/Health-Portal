package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {

    List<Invoice> findByPatientId(String patientId);
}