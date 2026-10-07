package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import lk.gamage.backend.healthbridgebackend.enums.InventoryStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medicine_inventory")

public class Inventory {

    @Id
    private String id;

    private String pharmacyId;
    private String medicineId;
    private String medicineCode;
    private String medicineName;

    private String batchNumber;
    private String supplierId;
    private String supplierName;

    private int quantityInStock;
    private int reorderLevel;
    private int reorderQuantity;

    private double costPrice;
    private double sellingPrice;

    private LocalDate manufactureDate;
    private LocalDate expiryDate;

    //    private String status;
    private InventoryStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}