package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.UserProfileResponse;
import lk.gamage.backend.healthbridgebackend.dto.UserProfileUpdateRequest;
import lk.gamage.backend.healthbridgebackend.model.LocalizationPrefs;
import lk.gamage.backend.healthbridgebackend.model.NotificationPrefs;
import lk.gamage.backend.healthbridgebackend.model.PrivacyPrefs;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private AuditLogService auditLogService;

    public UserProfileResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        return new UserProfileResponse(user);
    }

    public UserProfileResponse getProfileById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
        return new UserProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth().trim());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender().trim());
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getEmergencyContact() != null) {
            user.setEmergencyContact(request.getEmergencyContact().trim());
        }
        if (request.getMedicalHistory() != null) {
            user.setMedicalHistory(request.getMedicalHistory().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse deactivateAccount(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setAccountStatus("Inactive");
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse reactivateAccount(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setAccountStatus("Active");
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse updateTwoFactor(String email, boolean enabled) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setTwoFactorEnabled(enabled);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse updateNotificationPrefs(String email, NotificationPrefs prefs) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setNotificationPrefs(prefs);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse updatePrivacyPrefs(String email, PrivacyPrefs prefs) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setPrivacyPrefs(prefs);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse updateLocalizationPrefs(String email, LocalizationPrefs prefs) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
        user.setLocalizationPrefs(prefs);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse updateProfilePicture(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file uploaded");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new IllegalArgumentException("Image must be smaller than 5MB");
        }

        Map<String, String> result = cloudinaryService.uploadFile(file, "profile-pictures");
        user.setPicture(result.get("url"));
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    public UserProfileResponse removeProfilePicture(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        user.setPicture(null);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }

    // Get All Users
    public List<UserProfileResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserProfileResponse::new)
                .collect(Collectors.toList());
    }

    // --- SUPER ADMIN ACTIONS ---

    public UserProfileResponse updateUserStatus(String id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        user.setAccountStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);

        // Record in Audit Log
        lk.gamage.backend.healthbridgebackend.dto.AuditLogDto logDto = new lk.gamage.backend.healthbridgebackend.dto.AuditLogDto();
        logDto.setUser("Super Admin");
        logDto.setRole("Super Admin");
        logDto.setEvent("User Status Update");
        logDto.setModule("User Management");
        logDto.setActionDetails("Updated user " + user.getEmail() + " status to " + status);
        logDto.setRefId(id);
        logDto.setIpDevice("System");
        logDto.setStatus("Success");
        logDto.setSeverity("High");
        auditLogService.logAction(logDto);

        return new UserProfileResponse(savedUser);
    }

    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        userRepository.delete(user);

        // Record in Audit Log
        lk.gamage.backend.healthbridgebackend.dto.AuditLogDto logDto = new lk.gamage.backend.healthbridgebackend.dto.AuditLogDto();
        logDto.setUser("Super Admin");
        logDto.setRole("Super Admin");
        logDto.setEvent("User Deleted");
        logDto.setModule("User Management");
        logDto.setActionDetails("Deleted user " + user.getEmail() + " permanently.");
        logDto.setRefId(id);
        logDto.setIpDevice("System");
        logDto.setStatus("Success");
        logDto.setSeverity("Critical");
        auditLogService.logAction(logDto);
    }

    public UserProfileResponse updateUserDetails(String id, UserProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getBloodGroup() != null) user.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) user.setEmergencyContact(request.getEmergencyContact());
        if (request.getMedicalHistory() != null) user.setMedicalHistory(request.getMedicalHistory());

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser);
    }
}