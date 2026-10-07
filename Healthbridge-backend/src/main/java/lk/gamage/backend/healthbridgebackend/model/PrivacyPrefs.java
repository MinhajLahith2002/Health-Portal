package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacyPrefs {
    @Builder.Default
    private String profileVisibility = "doctors_only"; // public | doctors_only | private
    @Builder.Default
    private boolean shareDataForResearch = false;
}