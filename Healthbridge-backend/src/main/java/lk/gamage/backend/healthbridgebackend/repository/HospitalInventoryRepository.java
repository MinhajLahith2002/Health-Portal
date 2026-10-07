package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.HospitalInventory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HospitalInventoryRepository
        extends MongoRepository<HospitalInventory, String> {

    List<HospitalInventory>
    findByHospitalId(String hospitalId);

    List<HospitalInventory>
    findByQuantityLessThanEqual(Integer reorderLevel);
}