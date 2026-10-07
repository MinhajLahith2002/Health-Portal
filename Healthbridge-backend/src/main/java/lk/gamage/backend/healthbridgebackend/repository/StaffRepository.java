package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends MongoRepository<Staff, String> {

    Optional<Staff> findByStaffId(String staffId);

    boolean existsByStaffId(String staffId);

    boolean existsByEmailIgnoreCase(String email);

    List<Staff> findByDepartmentIgnoreCase(String department);

    List<Staff> findByDutyStatusIgnoreCase(String dutyStatus);

    List<Staff> findByAccountStatusIgnoreCase(String accountStatus);

    long countByAccountStatusIgnoreCase(String accountStatus);

    long countByDutyStatusIgnoreCase(String dutyStatus);
}
