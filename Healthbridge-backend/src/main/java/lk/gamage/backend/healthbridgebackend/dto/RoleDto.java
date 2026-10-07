package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class RoleDto {
    private String roleId;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Type cannot be blank")
    private String type;

    private String status;
    private List<String> permissionIds;
    private String riskLevel;
    private String riskRecommendations;
}
