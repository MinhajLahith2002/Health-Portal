package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalInventoryResponse {

    private String id;

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

    private boolean lowStock;
}