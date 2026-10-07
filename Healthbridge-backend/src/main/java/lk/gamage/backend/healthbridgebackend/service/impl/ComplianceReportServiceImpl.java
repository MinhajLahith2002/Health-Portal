package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.ComplianceReportRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.ComplianceReportResponse;
import lk.gamage.backend.healthbridgebackend.model.ComplianceReport;
import lk.gamage.backend.healthbridgebackend.repository.ComplianceReportRepository;
import lk.gamage.backend.healthbridgebackend.service.ComplianceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplianceReportServiceImpl
        implements ComplianceReportService {

    private final ComplianceReportRepository
            reportRepository;

    @Override
    public ComplianceReportResponse createReport(
            ComplianceReportRequest request) {

        ComplianceReport report =
                new ComplianceReport();

        report.setHospitalId(request.getHospitalId());
        report.setReportType(request.getReportType());
        report.setPeriod(request.getPeriod());
        report.setStatus(request.getStatus());
        report.setSummary(request.getSummary());
        report.setPreparedBy(request.getPreparedBy());

        report.setReportDate(LocalDate.now());
        report.setCreatedAt(LocalDateTime.now());

        return mapToResponse(
                reportRepository.save(report)
        );
    }

    @Override
    public List<ComplianceReportResponse>
    getAllReports() {

        return reportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ComplianceReportResponse getReport(
            String id) {

        ComplianceReport report =
                reportRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Compliance report not found: "
                                                + id
                                )
                        );

        return mapToResponse(report);
    }

    @Override
    public List<ComplianceReportResponse>
    getHospitalReports(String hospitalId) {

        return reportRepository
                .findByHospitalId(hospitalId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ComplianceReportResponse updateReport(
            String id,
            ComplianceReportRequest request) {

        ComplianceReport report =
                reportRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Compliance report not found: "
                                                + id
                                )
                        );

        report.setHospitalId(request.getHospitalId());
        report.setReportType(request.getReportType());
        report.setPeriod(request.getPeriod());
        report.setStatus(request.getStatus());
        report.setSummary(request.getSummary());
        report.setPreparedBy(request.getPreparedBy());

        return mapToResponse(
                reportRepository.save(report)
        );
    }

    @Override
    public void deleteReport(String id) {

        if (!reportRepository.existsById(id)) {
            throw new RuntimeException(
                    "Compliance report not found: " + id
            );
        }

        reportRepository.deleteById(id);
    }

    private ComplianceReportResponse mapToResponse(
            ComplianceReport report) {

        return ComplianceReportResponse.builder()
                .id(report.getId())
                .hospitalId(report.getHospitalId())
                .reportType(report.getReportType())
                .period(report.getPeriod())
                .status(report.getStatus())
                .summary(report.getSummary())
                .preparedBy(report.getPreparedBy())
                .reportDate(report.getReportDate())
                .createdAt(report.getCreatedAt())
                .build();
    }
}