package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.ComplianceReportRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.ComplianceReportResponse;
import lk.gamage.backend.healthbridgebackend.service.ComplianceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital-billing/compliance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ComplianceReportController {

    private final ComplianceReportService
            complianceReportService;

    @PostMapping
    public ResponseEntity<ComplianceReportResponse>
    createReport(
            @RequestBody ComplianceReportRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        complianceReportService.createReport(
                                request
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<ComplianceReportResponse>>
    getAllReports() {

        return ResponseEntity.ok(
                complianceReportService.getAllReports()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplianceReportResponse>
    getReport(@PathVariable String id) {

        return ResponseEntity.ok(
                complianceReportService.getReport(id)
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<ComplianceReportResponse>>
    getHospitalReports(
            @PathVariable String hospitalId) {

        return ResponseEntity.ok(
                complianceReportService.getHospitalReports(
                        hospitalId
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComplianceReportResponse>
    updateReport(
            @PathVariable String id,
            @RequestBody ComplianceReportRequest request) {

        return ResponseEntity.ok(
                complianceReportService.updateReport(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteReport(@PathVariable String id) {

        complianceReportService.deleteReport(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}