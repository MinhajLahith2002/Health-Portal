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
@Document(collection = "hospital_branches")
public class Branch {

    @Id
    private String id;
    private String branchCode;
    private String branchName;
    private String hospitalId;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String status; // ACTIVE, INACTIVE
    private Integer totalBeds;
    private Boolean emergencyReady;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
