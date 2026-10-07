package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentStatsDto {
    private long totalInventory;
    private double operationalRate;
    private long underMaintenance;
    private long calibrationDue;
}
