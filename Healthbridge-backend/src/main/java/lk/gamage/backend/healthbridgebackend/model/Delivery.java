package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import lk.gamage.backend.healthbridgebackend.enums.DeliveryStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medicine_deliveries")
public class Delivery {

    @Id
    private String id;

    private String deliveryCode;
    private String orderCode;

    private String pharmacyId;
    private String patientId;
    private String prescriptionId;
    private String saleId;

    private List<DeliveryItem> items;

    private String deliveryAddress;
    private String contactPhone;

    private DeliveryStatus status;

    private String assignedRiderId;
    private String assignedRiderName;

    private String fulfillmentType;
    private boolean actionRequired;
    private String courierService;

    private LocalDateTime scheduledAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime deliveredAt;

    private String remarks;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryItem {
        private String medicineId;
        private String medicineName;
        private int quantity;
    }
}