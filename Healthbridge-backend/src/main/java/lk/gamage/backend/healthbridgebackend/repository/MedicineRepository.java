package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends MongoRepository<Medicine, String> {
    Optional<Medicine> findByMedicineCode(String medicineCode);
    List<Medicine> findByNameContainingIgnoreCase(String name);
    boolean existsByMedicineCode(String medicineCode);
}