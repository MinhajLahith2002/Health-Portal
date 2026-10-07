package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String patientId;

    private String patientEmail;

    private String patientName;

    private String description;

    private String category; // CONSULTATION, LAB_TEST, PRESCRIPTION, INSURANCE, OTHER, X_RAY

    private BigDecimal amount;

    private String cardHolderName;

    private String maskedCardNumber; // Only last 4 digits stored, e.g. "****-****-****-1234"

    private String confirmationCode; // 6-digit OTP

    private LocalDateTime codeExpiresAt;

    @Builder.Default
    private String status = "PENDING_CONFIRMATION"; // PENDING_CONFIRMATION, CONFIRMED, EXPIRED, CANCELLED

    private LocalDateTime createdAt;

    private LocalDateTime confirmedAt;

    private Boolean emailSent;
}
