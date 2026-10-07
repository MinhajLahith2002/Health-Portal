package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {

    Optional<Department> findByDepartmentId(String departmentId);

    boolean existsByDepartmentId(String departmentId);

    boolean existsByNameIgnoreCase(String name);

    Optional<Department> findByNameIgnoreCase(String name);

    List<Department> findByStatusIgnoreCase(String status);
}
