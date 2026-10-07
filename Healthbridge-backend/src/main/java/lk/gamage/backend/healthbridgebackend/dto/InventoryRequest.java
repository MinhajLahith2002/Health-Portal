package lk.gamage.backend.healthbridgebackend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InventoryRequest {

    // hospital-wide inventory fields
    private String itemCode;
    private String itemName;
    private String category;
    private String supplier;
    private Integer quantity;
    private Integer minimumStock;
    private String unit;
    private Double unitCost;
    private LocalDate expiryDate;

    // pharmacy-specific additions
    private String pharmacyId;
    private String medicineId;
    private String batchNumber;
    private String supplierId;
    private Double sellingPrice;
    private Integer reorderQuantity;
    private LocalDate manufactureDate;
}