package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.UserProfileResponse;
import lk.gamage.backend.healthbridgebackend.dto.UserProfileUpdateRequest;
import lk.gamage.backend.healthbridgebackend.model.LocalizationPrefs;
import lk.gamage.backend.healthbridgebackend.model.NotificationPrefs;
import lk.gamage.backend.healthbridgebackend.model.PrivacyPrefs;
import lk.gamage.backend.healthbridgebackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse profile = userService.getProfileByEmail(email);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody UserProfileUpdateRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.updateProfile(email, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating profile: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable String id) {
        try {
            UserProfileResponse profile = userService.getProfileById(id);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/deactivate")
    public ResponseEntity<?> deactivateMyAccount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.deactivateAccount(email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deactivating account: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/reactivate")
    public ResponseEntity<?> reactivateMyAccount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.reactivateAccount(email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error reactivating account: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/2fa")
    public ResponseEntity<?> updateTwoFactor(@RequestBody Map<String, Boolean> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            Boolean enabled = request.get("enabled");
            UserProfileResponse updated = userService.updateTwoFactor(email, enabled != null && enabled);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating two-factor authentication: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/notifications")
    public ResponseEntity<?> updateNotifications(@RequestBody NotificationPrefs prefs) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.updateNotificationPrefs(email, prefs);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating notification preferences: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/privacy")
    public ResponseEntity<?> updatePrivacy(@RequestBody PrivacyPrefs prefs) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.updatePrivacyPrefs(email, prefs);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating privacy settings: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/localization")
    public ResponseEntity<?> updateLocalization(@RequestBody LocalizationPrefs prefs) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.updateLocalizationPrefs(email, prefs);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating localization settings: " + e.getMessage()));
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> updateProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.updateProfilePicture(email, file);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading picture: " + e.getMessage()));
        }
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<?> removeProfilePicture() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            String email = auth.getName();
            UserProfileResponse updated = userService.removeProfilePicture(email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error removing picture: " + e.getMessage()));
        }
    }

    //Get All Users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserProfileResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving users: " + e.getMessage()));
        }
    }

    // --- SUPER ADMIN ENDPOINTS ---

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
            }
            UserProfileResponse updated = userService.updateUserStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating user status: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting user: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserDetails(@PathVariable String id, @RequestBody UserProfileUpdateRequest request) {
        try {
            UserProfileResponse updated = userService.updateUserDetails(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating user details: " + e.getMessage()));
        }
    }
}