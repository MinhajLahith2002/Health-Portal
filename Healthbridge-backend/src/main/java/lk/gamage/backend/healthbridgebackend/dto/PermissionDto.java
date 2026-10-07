package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PermissionDto {

    @NotBlank(message = "Module name is required")
    private String moduleName;

    private boolean canView;
    private boolean canCreate;
    private boolean canEdit;
    private boolean canDelete;
    private boolean canApprove;
    private boolean canExport;
    private boolean canManage;
}
