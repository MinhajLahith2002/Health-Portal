package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePrescriptionRequest {
    private List<PrescriptionItemRequest> items;
    private String notes;
    private String diagnosis;
    private String status;
}