package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "system_settings")
public class SystemSetting {
    @Id
    private String id;
    private String category;
    private String settingKey;
    private String settingValue;
    private String description;
    private String lastModifiedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
