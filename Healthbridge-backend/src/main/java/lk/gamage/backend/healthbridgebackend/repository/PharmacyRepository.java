package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Pharmacy;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyRepository extends MongoRepository<Pharmacy, String> {

    Optional<Pharmacy> findByRegistrationNumber(String registrationNumber);

    Optional<Pharmacy> findByLicenseNumber(String licenseNumber);

    List<Pharmacy> findByActiveTrue();

    List<Pharmacy> findByApprovedFalse(); // pending Super Admin approval

    List<Pharmacy> findByOwnerUserId(String ownerUserId); // pharmacist/owner's branches
}