package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchRequestDto {

    private String branchCode;

    @NotBlank(message = "Branch Name is required")
    private String branchName;

    private String hospitalId;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String status;
    private Integer totalBeds;
    private Boolean emergencyReady;
}
