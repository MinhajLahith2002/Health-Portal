package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrugInteraction {
    private String medicine1;
    private String medicine2;
    private String severity; // MILD, MODERATE, SEVERE
    private String description;
}