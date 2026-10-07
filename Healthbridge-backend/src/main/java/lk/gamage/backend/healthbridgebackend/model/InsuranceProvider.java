package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "insurance_providers")
public class InsuranceProvider {
    @Id
    private String id;
    private String providerId; // e.g. PRV-84920
    private String logoText;
    private String logoColor;
    private String name;
    private String licenseNo;
    private String contactName;
    private String contactRole;
    private List<String> coverageRegions;
    private String status; // Approved, Pending, Suspended
}
