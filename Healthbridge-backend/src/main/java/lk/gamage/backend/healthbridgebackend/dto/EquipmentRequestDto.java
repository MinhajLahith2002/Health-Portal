package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentRequestDto {
    private String assetId;
    private String name;
    private String category;
    private String department;
    private String location;
    private String serialNo;
    private String status;
    private String calibrationDueDate;
    private String model;
    private String supplier;
    private String purchaseDate;
    private String warrantyExpiry;
    private Integer depreciationPercentage;
    private Double initialValue;
    private Double currentValue;
    private String alertMessage;
    private String branchId;
    private String branchCode;
}
