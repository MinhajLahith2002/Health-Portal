package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalInventoryRequest {

    private String hospitalId;

    private String itemCode;

    private String itemName;

    private String category;

    private Integer quantity;

    private Integer reorderLevel;

    private String unit;

    private String supplier;

    private LocalDate expiryDate;

    private Double unitCost;

    private String location;
}