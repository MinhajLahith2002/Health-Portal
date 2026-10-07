package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingItemResponse {

    private String id;
    private String invoiceId;
    private String patientId;
    private String category;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;

    // Cross-Module Links
    private String medicineId;
    private String medicineCode;
    private String labTestId;
    private String inventoryId;
    private String prescriptionItemRef;
}