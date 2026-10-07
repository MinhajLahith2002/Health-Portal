package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Inventory;
import lk.gamage.backend.healthbridgebackend.enums.InventoryStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface InventoryRepository extends MongoRepository<Inventory, String> {
    List<Inventory> findByPharmacyId(String pharmacyId);
    List<Inventory> findByPharmacyIdAndMedicineId(String pharmacyId, String medicineId);

    @Query("{ 'pharmacyId': ?0, '$expr': { '$lte': ['$quantityInStock', '$reorderLevel'] } }")
    List<Inventory> findLowStockByPharmacyId(String pharmacyId);

    List<Inventory> findByPharmacyIdAndStatus(String pharmacyId, InventoryStatus status);
}