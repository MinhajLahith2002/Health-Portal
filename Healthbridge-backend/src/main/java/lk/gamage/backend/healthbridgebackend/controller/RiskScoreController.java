package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.response.RiskScoreBreakdownResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.RiskScoreResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.RiskScoreStatisticsResponse;
import lk.gamage.backend.healthbridgebackend.mapper.FraudMapper;
import lk.gamage.backend.healthbridgebackend.model.RiskScore;
import lk.gamage.backend.healthbridgebackend.service.RiskScoringService;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreBreakdown;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreStatistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fraud/risk-scores")
@PreAuthorize("hasAnyRole('INSURANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
public class RiskScoreController {

    private static final Logger log = LoggerFactory.getLogger(RiskScoreController.class);

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private FraudMapper fraudMapper;

    /**
     * Get risk score for a specific patient
     * GET /api/fraud/risk-scores/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientRiskScore(@PathVariable String patientId) {
        try {
            RiskScore score = riskScoringService.getPatientRiskScore(patientId);
            
            if (score == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                    "message", "Patient risk score retrieved successfully",
                    "patientId", patientId,
                    "data", fraudMapper.toRiskScoreResponse(score)
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve patient risk score patientId={}", patientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve patient risk score."));
        }
    }

    /**
     * Get risk score for a specific claim
     * GET /api/fraud/risk-scores/claim/{claimId}
     */
    @GetMapping("/claim/{claimId}")
    public ResponseEntity<?> getClaimRiskScore(@PathVariable String claimId) {
        try {
            RiskScore score = riskScoringService.calculateClaimRiskScore(claimId);
            
            if (score == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                    "message", "Claim risk score calculated successfully",
                    "claimId", claimId,
                    "data", fraudMapper.toRiskScoreResponse(score)
            ));
        } catch (Exception e) {
            log.error("Failed to calculate claim risk score claimId={}", claimId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to calculate claim risk score."));
        }
    }

    /**
     * Get all high-risk patients
     * GET /api/fraud/risk-scores/high-risk/patients
     */
    @GetMapping("/high-risk/patients")
    public ResponseEntity<?> getHighRiskPatients() {
        try {
            List<RiskScore> scores = riskScoringService.getHighRiskPatients();
            List<RiskScoreResponse> responses = scores.stream()
                    .map(fraudMapper::toRiskScoreResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "High-risk patients retrieved successfully",
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve high-risk patients", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve high-risk patients."));
        }
    }

    /**
     * Get patients with increasing risk trend
     * GET /api/fraud/risk-scores/increasing-risk/patients
     */
    @GetMapping("/increasing-risk/patients")
    public ResponseEntity<?> getPatientsWithIncreasingRisk() {
        try {
            List<RiskScore> scores = riskScoringService.getPatientsWithIncreasingRisk();
            List<RiskScoreResponse> responses = scores.stream()
                    .map(fraudMapper::toRiskScoreResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                    "message", "Patients with increasing risk retrieved successfully",
                    "count", responses.size(),
                    "data", responses
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve increasing-risk patients", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve increasing-risk patients."));
        }
    }

    /**
     * Get risk score breakdown for a patient
     * GET /api/fraud/risk-scores/patient/{patientId}/breakdown
     */
    @GetMapping("/patient/{patientId}/breakdown")
    public ResponseEntity<?> getPatientRiskBreakdown(@PathVariable String patientId) {
        try {
            RiskScoreBreakdown breakdown = riskScoringService.getPatientRiskBreakdown(patientId);
            
            if (breakdown == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of(
                    "message", "Patient risk breakdown retrieved successfully",
                    "patientId", patientId,
                    "data", fraudMapper.toRiskScoreBreakdownResponse(breakdown)
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve risk breakdown patientId={}", patientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve risk breakdown."));
        }
    }

    /**
     * Get risk score statistics
     * GET /api/fraud/risk-scores/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getRiskScoreStatistics() {
        try {
            RiskScoreStatistics statistics = riskScoringService.getRiskScoreStatistics();
            
            return ResponseEntity.ok(Map.of(
                    "message", "Risk score statistics retrieved successfully",
                    "data", fraudMapper.toRiskScoreStatisticsResponse(statistics)
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve risk statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve risk statistics."));
        }
    }

    /**
     * Trigger manual recalculation of all risk scores
     * POST /api/fraud/risk-scores/recalculate
     */
    @PostMapping("/recalculate")
    public ResponseEntity<?> recalculateAllRiskScores() {
        try {
            riskScoringService.recalculateAllRiskScores();
            
            return ResponseEntity.ok(Map.of(
                    "message", "All risk scores recalculated successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to recalculate risk scores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to recalculate risk scores."));
        }
    }

    /**
     * Update risk trends for all scores
     * POST /api/fraud/risk-scores/update-trends
     */
    @PostMapping("/update-trends")
    public ResponseEntity<?> updateAllRiskTrends() {
        try {
            riskScoringService.updateAllRiskTrends();
            
            return ResponseEntity.ok(Map.of(
                    "message", "Risk trends updated successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to update risk trends", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to update risk trends."));
        }
    }
}
