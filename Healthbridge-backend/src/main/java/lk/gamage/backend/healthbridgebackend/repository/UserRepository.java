package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    List<User> findByRoleIn(List<String> roles);
    List<User> findByRole(String role);
    List<User> findByAccountStatus(String accountStatus);
}
