package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.ComplianceReportRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.ComplianceReportResponse;

import java.util.List;

public interface ComplianceReportService {

    ComplianceReportResponse createReport(
            ComplianceReportRequest request
    );

    List<ComplianceReportResponse> getAllReports();

    ComplianceReportResponse getReport(String id);

    List<ComplianceReportResponse> getHospitalReports(
            String hospitalId
    );

    ComplianceReportResponse updateReport(
            String id,
            ComplianceReportRequest request
    );

    void deleteReport(String id);
}