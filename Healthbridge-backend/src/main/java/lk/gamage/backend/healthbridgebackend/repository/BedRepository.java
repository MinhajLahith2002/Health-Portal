package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Bed;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends MongoRepository<Bed, String> {

    Optional<Bed> findByBedId(String bedId);

    boolean existsByBedId(String bedId);

    List<Bed> findByWardIgnoreCase(String ward);

    List<Bed> findByStatusIgnoreCase(String status);

    List<Bed> findByWardIgnoreCaseAndStatusIgnoreCase(String ward, String status);
}
