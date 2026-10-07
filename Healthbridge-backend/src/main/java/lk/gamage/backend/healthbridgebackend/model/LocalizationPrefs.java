package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalizationPrefs {
    @Builder.Default
    private String language = "en";
    @Builder.Default
    private String timezone = "Asia/Colombo";
}