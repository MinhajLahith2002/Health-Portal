package lk.gamage.backend.healthbridgebackend.config;

import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        List<String> defaultRoles = Role.ALL_ROLES;

        for (String roleName : defaultRoles) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setRoleId("ROLE_" + roleName);
                role.setName(roleName);
                role.setType("SYSTEM");
                role.setStatus("ACTIVE");
                role.setUserCount(0);
                role.setPermissionIds(new ArrayList<>());
                role.setRiskLevel(roleName.contains("ADMIN") ? "HIGH" : "LOW");
                role.setRiskRecommendations(roleName.contains("ADMIN") ? "Requires multi-factor authentication" : "Standard user access");
                role.setUpdatedAt(LocalDateTime.now());

                roleRepository.save(role);
                log.info("[RoleDataInitializer] Initialized system role: {}", roleName);
            }
        }
    }
}
