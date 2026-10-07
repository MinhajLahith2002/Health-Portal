package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {
    private String category;

    @NotBlank(message = "Setting key is required")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    private String settingValue;

    private String description;
}
