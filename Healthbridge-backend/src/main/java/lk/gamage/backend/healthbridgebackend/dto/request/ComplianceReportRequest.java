package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportRequest {

    private String hospitalId;

    private String reportType;

    private String period;

    private String status;

    private String summary;

    private String preparedBy;
}