package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stock_movements")
public class StockMovement {

    @Id
    private String id;

    private String inventoryId;

    private String itemCode;

    private Integer quantity;

    private String reason;

    private String performedBy;

    private LocalDateTime createdAt;
}
