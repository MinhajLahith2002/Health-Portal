package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {
    Optional<Equipment> findByAssetId(String assetId);
    boolean existsByAssetId(String assetId);
    List<Equipment> findByDepartment(String department);
    List<Equipment> findByCategory(String category);
    List<Equipment> findByStatus(String status);
}
