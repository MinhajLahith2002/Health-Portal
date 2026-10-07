package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedResponseDto {

    private String id;
    private String bedId;
    private String code;
    private String ward;
    private String status;
    private String bedType;
    private String branchId;
    private String branchCode;
    private PatientInfoDto patient;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
