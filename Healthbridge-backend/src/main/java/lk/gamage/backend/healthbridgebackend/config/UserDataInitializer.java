package lk.gamage.backend.healthbridgebackend.config;

import lk.gamage.backend.healthbridgebackend.model.AuthProvider;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createDefaultUserIfNotFound("admin@healthbridge.lk", "System Administrator", Role.ADMIN, "password123");
        createDefaultUserIfNotFound("doctor@healthbridge.lk", "Dr. Maya Perera", Role.DOCTOR, "password123");
        createDefaultUserIfNotFound("superadmin@healthbridge.lk", "Chief Administrator", Role.SUPER_ADMIN, "password123");
        createDefaultUserIfNotFound("patient@healthbridge.lk", "John Doe", Role.PATIENT, "password123");
    }

    private void createDefaultUserIfNotFound(String email, String fullName, String role, String rawPassword) {
        String normalizedEmail = email.toLowerCase().trim();
        if (userRepository.findByEmail(normalizedEmail).isEmpty()) {
            User user = User.builder()
                    .email(normalizedEmail)
                    .fullName(fullName)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .accountStatus("ACTIVE")
                    .provider(AuthProvider.LOCAL)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
            log.info("[UserDataInitializer] Initialized default user: {} ({})", email, role);
        }
    }
}
