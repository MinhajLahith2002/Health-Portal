package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportResponse {

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