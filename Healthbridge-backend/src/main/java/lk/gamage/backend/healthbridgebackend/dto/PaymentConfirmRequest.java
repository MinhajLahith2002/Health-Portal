package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {

    @NotBlank(message = "Confirmation code is required")
    @Size(min = 6, max = 6, message = "Confirmation code must be 6 digits")
    private String confirmationCode;
}
