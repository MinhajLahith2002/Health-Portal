package lk.gamage.backend.healthbridgebackend.dto;

import lk.gamage.backend.healthbridgebackend.model.Branch;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponseDto {

    private String id;
    private String branchCode;
    private String branchName;
    private String hospitalId;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String status;
    private Integer totalBeds;
    private Boolean emergencyReady;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BranchResponseDto fromEntity(Branch branch) {
        if (branch == null) return null;
        return BranchResponseDto.builder()
                .id(branch.getId())
                .branchCode(branch.getBranchCode())
                .branchName(branch.getBranchName())
                .hospitalId(branch.getHospitalId())
                .address(branch.getAddress())
                .city(branch.getCity())
                .phone(branch.getPhone())
                .email(branch.getEmail())
                .status(branch.getStatus())
                .totalBeds(branch.getTotalBeds())
                .emergencyReady(branch.getEmergencyReady())
                .createdAt(branch.getCreatedAt())
                .updatedAt(branch.getUpdatedAt())
                .build();
    }
}
