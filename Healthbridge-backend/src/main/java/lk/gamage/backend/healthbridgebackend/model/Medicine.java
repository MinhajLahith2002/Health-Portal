package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medicines")

public class Medicine {

    @Id
    private String id;

    @Indexed(unique = true)
    private String medicineCode;

    private String name;
    private String genericName;
    private String brand;
    private String manufacturer;
    private String category;
    private String dosageForm;
    private String strength;

    private boolean controlledDrug;
    private boolean prescriptionRequired;

    private double unitPrice;

    private List<String> substituteMedicineCodes;


    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}