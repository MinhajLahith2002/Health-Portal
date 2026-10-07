package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;
    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;
    private String phone; // Added for SOS compatibility

    private String password;

    @Builder.Default
    private String role = Role.PATIENT;

    private AuthProvider provider = AuthProvider.LOCAL;

    private String googleId;

    private String picture;

    private String dateOfBirth;

    private String gender;

    private String bloodGroup;
    private String bloodType; // Added for SOS compatibility

    private String address;

    private String branch;

    private String emergencyContact;

    private String medicalHistory;
    private List<String> allergies;
    private List<String> conditions;

    private String accountStatus = "Active";

    @Builder.Default
    private boolean twoFactorEnabled = false;

    @Builder.Default
    private NotificationPrefs notificationPrefs = new NotificationPrefs();

    @Builder.Default
    private PrivacyPrefs privacyPrefs = new PrivacyPrefs();

    @Builder.Default
    private LocalizationPrefs localizationPrefs = new LocalizationPrefs();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

}