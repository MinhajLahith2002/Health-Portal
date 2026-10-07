package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    private String id;
    private String roleId;
    private String name;
    private String type;
    private String status;
    private int userCount;
    private List<String> permissionIds;
    private String riskLevel;
    private String riskRecommendations;
    private LocalDateTime updatedAt;

    // Role constants for user authentication, authorization, and access control
    public static final String PATIENT = "PATIENT";
    public static final String ADMIN = "ADMIN";
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String DOCTOR = "DOCTOR";
    public static final String PHARMACIST = "PHARMACIST";
    public static final String INSURANCE_OFFICER = "INSURANCE_OFFICER";
    public static final String LAB_OFFICER = "LAB_OFFICER";

    public static final List<String> ALL_ROLES = List.of(
            PATIENT,
            ADMIN,
            SUPER_ADMIN,
            DOCTOR,
            PHARMACIST,
            INSURANCE_OFFICER,
            LAB_OFFICER);

    public static boolean isValidRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }
        return ALL_ROLES.contains(role.trim().toUpperCase());
    }
}
