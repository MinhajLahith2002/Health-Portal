package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Description is required")
    private String description;

    private String category; // CONSULTATION, LAB_TEST, PRESCRIPTION, INSURANCE, OTHER, X_RAY

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Card holder name is required")
    private String cardHolderName;

    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @NotBlank(message = "Expiry date is required")
    private String expiryDate;

    @NotBlank(message = "CVV is required")
    private String cvv;
}
