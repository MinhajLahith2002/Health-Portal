package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.FamilyMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FamilyMemberRepository extends MongoRepository<FamilyMember, String> {
    List<FamilyMember> findByPrimaryPatientIdOrderByAddedAtDesc(String primaryPatientId);
}
