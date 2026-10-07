package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "compliance_reports")
public class ComplianceReport {

    @Id
    private String id;

    private String hospitalId;

    private String reportType;

    private String period;

    private String status;

    private String summary;

    private String preparedBy;

    private LocalDate reportDate;

    private LocalDateTime createdAt;
}