package lk.gamage.backend.healthbridgebackend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InventoryResponse {

    private String id;
    private String itemCode;
    private String itemName;
    private String category;
    private Integer quantity;
    private Integer minimumStock;
    private String unit;
    private Double unitCost;
    private LocalDate expiryDate;

    private String pharmacyId;
    private String medicineId;
    private String batchNumber;
    private String supplierName;
    private Double sellingPrice;
    private String status;
}