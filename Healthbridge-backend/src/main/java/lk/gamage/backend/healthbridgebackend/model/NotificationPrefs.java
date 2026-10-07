package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPrefs {
    @Builder.Default
    private boolean email = true;
    @Builder.Default
    private boolean sms = false;
    @Builder.Default
    private boolean push = true;
}