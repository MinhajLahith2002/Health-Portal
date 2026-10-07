package lk.gamage.backend.healthbridgebackend.analytics.healthcare.controller;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsErrorResponse;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response.HealthcareAnalyticsResponse;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.service.HealthcareAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics/healthcare")
@CrossOrigin(origins = "http://localhost:3000")
public class HealthcareAnalyticsController {

    private final HealthcareAnalyticsService healthcareAnalyticsService;

    public HealthcareAnalyticsController(HealthcareAnalyticsService healthcareAnalyticsService) {
        this.healthcareAnalyticsService = healthcareAnalyticsService;
    }

    @GetMapping
    public HealthcareAnalyticsResponse getHealthcareAnalytics(
            @RequestParam(defaultValue = "month") String period
    ) {
        return healthcareAnalyticsService.getHealthcareAnalytics(period);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AnalyticsErrorResponse> handleInvalidPeriod(IllegalArgumentException exception) {
        AnalyticsErrorResponse response = new AnalyticsErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                exception.getMessage()
        );
        return ResponseEntity.badRequest().body(response);
    }
}
