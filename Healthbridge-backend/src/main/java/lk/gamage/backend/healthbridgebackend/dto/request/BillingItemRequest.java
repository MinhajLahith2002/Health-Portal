package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingItemRequest {

    private String invoiceId;
    private String patientId;
    private String category;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;

    // Cross-Module Links
    private String medicineId;
    private String medicineCode;
    private String labTestId;
    private String inventoryId;
    private String prescriptionItemRef;
}