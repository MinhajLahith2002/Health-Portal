package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hospital_inventory")
public class HospitalInventory {

    @Id
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
}