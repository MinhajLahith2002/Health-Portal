package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedStatsDto {

    private long totalBeds;
    private long occupiedBeds;
    private int occupiedPercentage;
    private long availableBeds;
    private long maintenanceBeds;
    private long cleaningBeds;
    private long reservedBeds;
}
