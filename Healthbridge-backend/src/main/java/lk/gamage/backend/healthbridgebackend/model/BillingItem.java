package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "billing_items")
public class BillingItem {

    @Id
    private String id;

    private String invoiceId;
    private String patientId;

    // ============================================================
    // Item Details
    // ============================================================
    private String category;      // CONSULTATION, MEDICINE, LAB_TEST, PROCEDURE, ROOM, OTHER
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;

    // ============================================================
    // Cross-Module Links (🆕 INTEGRATION)
    // ============================================================
    private String medicineId;    // 🆕 Link to Medicine (Dev 09)
    private String medicineCode;  // 🆕 Medicine code
    private String labTestId;     // 🆕 Link to LabTest (Dev 08)
    private String inventoryId;   // 🆕 Link to Inventory (Dev 09)

    // ============================================================
    // Metadata
    // ============================================================
    private String prescriptionItemRef;  // 🆕 Reference to PrescriptionItem
}