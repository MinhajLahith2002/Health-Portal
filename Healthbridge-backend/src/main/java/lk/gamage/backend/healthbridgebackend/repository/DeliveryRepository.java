package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Delivery;
import lk.gamage.backend.healthbridgebackend.enums.DeliveryStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends MongoRepository<Delivery, String> {
    Optional<Delivery> findByDeliveryCode(String deliveryCode);
    List<Delivery> findByPharmacyId(String pharmacyId);
    List<Delivery> findByPatientId(String patientId);
    List<Delivery> findByPharmacyIdAndStatus(String pharmacyId, DeliveryStatus status);
}