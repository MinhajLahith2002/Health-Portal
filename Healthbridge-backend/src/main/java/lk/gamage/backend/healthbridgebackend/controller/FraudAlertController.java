package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.AlertReviewRequest;
import lk.gamage.backend.healthbridgebackend.dto.request.FraudAlertRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.FraudAlertResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.FraudAlertStatisticsResponse;
import lk.gamage.backend.healthbridgebackend.mapper.FraudMapper;
import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import lk.gamage.backend.healthbridgebackend.service.FraudDetectionService;
import lk.gamage.backend.healthbridgebackend.service.FraudAlertStatistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fraud/alerts")
@PreAuthorize("hasAnyRole('INSURANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
public class FraudAlertController {

    private static final Logger log = LoggerFactory.getLogger(FraudAlertController.class);
    private static final int MAX_BULK_CLAIMS = 100;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private FraudMapper fraudMapper;

    /**
     * Get all pending fraud alerts
     * GET /api/fraud/alerts/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingAlerts() {
        try {
            List<FraudAlert> alerts = fraudDetectionService.getPendingAlerts();
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Pending alerts retrieved successfully",
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve pending fraud alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve pending alerts."));
        }
    }

    /**
     * Get high-risk fraud alerts
     * GET /api/fraud/alerts/high-risk
     */
    @GetMapping("/high-risk")
    public ResponseEntity<?> getHighRiskAlerts() {
        try {
            List<FraudAlert> alerts = fraudDetectionService.getHighRiskAlerts();
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "High-risk alerts retrieved successfully",
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve high-risk fraud alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve high-risk alerts."));
        }
    }

    /**
     * Get recent alerts from last N days
     * GET /api/fraud/alerts/recent?days=7
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentAlerts(@RequestParam(defaultValue = "7") Integer days) {
        if (days == null || days < 1 || days > 365) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "days must be between 1 and 365"));
        }
        try {
            List<FraudAlert> alerts = fraudDetectionService.getRecentAlerts(days);
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Recent alerts retrieved successfully",
                    "days", days,
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve recent fraud alerts days={}", days, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve recent alerts."));
        }
    }

    /**
     * Get alerts for a specific patient
     * GET /api/fraud/alerts/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getAlertsByPatientId(@PathVariable String patientId) {
        try {
            List<FraudAlert> alerts = fraudDetectionService.getAlertsByPatientId(patientId);
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Patient alerts retrieved successfully",
                    "patientId", patientId,
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve patient fraud alerts patientId={}", patientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve patient alerts."));
        }
    }

    /**
     * Get alerts for a specific claim
     * GET /api/fraud/alerts/claim/{claimId}
     */
    @GetMapping("/claim/{claimId}")
    public ResponseEntity<?> getAlertsByClaimId(@PathVariable String claimId) {
        try {
            List<FraudAlert> alerts = fraudDetectionService.getAlertsByClaimId(claimId);
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Claim alerts retrieved successfully",
                    "claimId", claimId,
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve claim fraud alerts claimId={}", claimId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve claim alerts."));
        }
    }

    /**
     * Analyze a specific claim for fraud
     * POST /api/fraud/alerts/analyze/{claimId}
     */
    @PostMapping("/analyze/{claimId}")
    public ResponseEntity<?> analyzeClaim(@PathVariable String claimId) {
        try {
            FraudAlert alert = fraudDetectionService.analyzeClaimForFraud(claimId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", alert != null ? "Fraud detected" : "No fraud detected");
            response.put("claimId", claimId);
            response.put("alert", alert != null ? fraudMapper.toFraudAlertResponse(alert) : null);
            return ResponseEntity.ok(response);
        } catch (lk.gamage.backend.healthbridgebackend.exception.FraudDetectionException e) {
            // Not found or incomplete claim data is an expected business outcome, not a server fault.
            log.warn("Fraud analysis skipped for claimId={}: {}", claimId, e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("claimId", claimId);
            response.put("alert", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to analyze claim claimId={}", claimId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to analyze claim."));
        }
    }

    /**
     * Review an alert and mark as confirmed or false positive
     * PUT /api/fraud/alerts/{alertId}/review
     */
    @PutMapping("/{alertId}/review")
    public ResponseEntity<?> reviewAlert(
            @PathVariable String alertId,
            @Valid @RequestBody AlertReviewRequest request,
            BindingResult bindingResult,
            Authentication authentication) {
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err -> 
                    errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Validation failed", "errors", errors));
        }

        try {
            FraudAlert reviewedAlert = fraudDetectionService.reviewAlert(
                    alertId,
                    request.getStatus(),
                    request.getReviewNotes(),
                    getAuthenticatedUserId(authentication)
            );
            
            return ResponseEntity.ok(Map.of(
                    "message", "Alert reviewed successfully",
                    "data", fraudMapper.toFraudAlertResponse(reviewedAlert)
            ));
        } catch (Exception e) {
            log.error("Failed to review fraud alert alertId={}", alertId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to review alert."));
        }
    }

    private String getAuthenticatedUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        throw new IllegalStateException("Authenticated reviewer identity is unavailable");
    }

    /**
     * Get fraud alert statistics
     * GET /api/fraud/alerts/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getAlertStatistics() {
        try {
            FraudAlertStatistics statistics = fraudDetectionService.getAlertStatistics();
            
            return ResponseEntity.ok(Map.of(
                    "message", "Alert statistics retrieved successfully",
                    "data", fraudMapper.toFraudAlertStatisticsResponse(statistics)
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve fraud alert statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve fraud statistics."));
        }
    }

    /**
     * Trigger bulk analysis of multiple claims
     * POST /api/fraud/alerts/bulk-analyze
     */
    @PostMapping("/bulk-analyze")
    public ResponseEntity<?> bulkAnalyzeClaims(@RequestBody List<String> claimIds) {
        try {
            if (claimIds == null || claimIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Claim IDs list cannot be empty"));
            }

            List<String> uniqueClaimIds = new ArrayList<>(new LinkedHashSet<>(claimIds));
            if (uniqueClaimIds.size() > MAX_BULK_CLAIMS) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "A maximum of " + MAX_BULK_CLAIMS + " unique claim IDs is allowed"));
            }

            List<FraudAlert> alerts = new ArrayList<>();
            List<Map<String, String>> failures = new ArrayList<>();
            for (String claimId : uniqueClaimIds) {
                try {
                    FraudAlert alert = fraudDetectionService.analyzeClaimForFraud(claimId);
                    if (alert != null) {
                        alerts.add(alert);
                    }
                } catch (Exception exception) {
                    log.error("Bulk fraud analysis failed claimId={}", claimId, exception);
                    failures.add(Map.of("claimId", String.valueOf(claimId), "message", "Analysis failed"));
                }
            }
            List<FraudAlertResponse> responses = alerts.stream()
                    .map(fraudMapper::toFraudAlertResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Bulk analysis completed successfully",
                        "processedCount", uniqueClaimIds.size() - failures.size(),
                        "failedCount", failures.size(),
                    "fraudDetectedCount", responses.size(),
                        "failures", failures,
                    "data", responses
            ));
        } catch (Exception e) {
                    log.error("Bulk fraud analysis request failed", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Unable to complete bulk analysis."));
        }
    }
}
