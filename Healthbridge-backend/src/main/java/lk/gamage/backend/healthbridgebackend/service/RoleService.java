package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.RoleDto;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public Role createRole(RoleDto dto) {
        if (roleRepository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Role with name " + dto.getName() + " already exists.");
        }

        Role role = new Role();
        role.setRoleId(dto.getRoleId());
        role.setName(dto.getName());
        role.setType(dto.getType());
        role.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        role.setPermissionIds(dto.getPermissionIds());
        role.setRiskLevel(dto.getRiskLevel());
        role.setRiskRecommendations(dto.getRiskRecommendations());

        role.setUserCount(0);
        role.setUpdatedAt(LocalDateTime.now());

        return roleRepository.save(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<Role> getRolesByType(String type) {
        return roleRepository.findByType(type);
    }

    public Role updateRole(String id, RoleDto dto) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));

        role.setRoleId(dto.getRoleId());
        role.setName(dto.getName());
        role.setType(dto.getType());
        role.setStatus(dto.getStatus());
        role.setPermissionIds(dto.getPermissionIds());
        role.setRiskLevel(dto.getRiskLevel());
        role.setRiskRecommendations(dto.getRiskRecommendations());

        role.setUpdatedAt(LocalDateTime.now());

        return roleRepository.save(role);
    }

    public java.util.Map<String, Long> getRoleSummary() {
        long totalRoles = roleRepository.count();
        long customRoles = roleRepository.findByType("CUSTOM").size();
        return java.util.Map.of(
                "totalRoles", totalRoles,
                "activeUsers", 0L,
                "customRoles", (long) customRoles,
                "highRiskPermissions", 0L,
                "recentChanges", 0L);
    }
}
