package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedRequestDto {

    private String bedId;
    private String code;
    private String ward;
    private String status;
    private String bedType;
    private String branchId;
    private String branchCode;
}
