package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "laboratories")
public class Laboratory {
    @Id
    private String id;
    private String labId; // e.g. LB-123
    private String name;
    private String address;
    private String license;
    private String owner;
    private String requestDate;
    private String approvedDate;
    private String status; // Pending, Approved, Rejected
}
