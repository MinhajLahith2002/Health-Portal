package lk.gamage.backend.healthbridgebackend.analytics.reports.controller;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsErrorResponse;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.GenerateAnalyticsReportRequest;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.AnalyticsReportCapabilitiesResponse;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.AnalyticsReportResponse;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.ReportsAnalyticsResponseDTO;
import lk.gamage.backend.healthbridgebackend.analytics.reports.service.AnalyticsReportsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsReportsController {

    private final AnalyticsReportsService analyticsReportsService;

    public AnalyticsReportsController(AnalyticsReportsService analyticsReportsService) {
        this.analyticsReportsService = analyticsReportsService;
    }

    @PostMapping("/generate")
    public AnalyticsReportResponse generatePreview(@RequestBody GenerateAnalyticsReportRequest request) {
        return analyticsReportsService.generatePreview(request);
    }

    @GetMapping("/capabilities")
    public AnalyticsReportCapabilitiesResponse getCapabilities() {
        return analyticsReportsService.getCapabilities();
    }

    @GetMapping
    public ReportsAnalyticsResponseDTO getReportsAnalytics(
            @RequestParam(defaultValue = "month") String period
    ) {
        return analyticsReportsService.getReportsAnalytics(period);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AnalyticsErrorResponse> handleInvalidRequest(IllegalArgumentException exception) {
        AnalyticsErrorResponse response = new AnalyticsErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                exception.getMessage()
        );
        return ResponseEntity.badRequest().body(response);
    }
}
