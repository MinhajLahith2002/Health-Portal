package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedTransferRequestDto {

    private String destinationWard;
    private String availableBedId;
    private String reason;
    private String transferDate;
    private String transferTime;
    private String priority; // Routine or Urgent
}
