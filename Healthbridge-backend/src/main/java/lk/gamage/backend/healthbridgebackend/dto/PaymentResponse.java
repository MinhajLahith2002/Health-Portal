package lk.gamage.backend.healthbridgebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String id;

    private String patientId;
    private String patientName;
    private String patientEmail;

    private String description;
    private String category;

    private BigDecimal amount;

    private String cardHolderName;
    private String maskedCardNumber;

    private String status; // PENDING_CONFIRMATION, CONFIRMED, EXPIRED, CANCELLED

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    // 🆕 Billing Integration
    private String invoiceId;
    private String invoiceNumber;
}