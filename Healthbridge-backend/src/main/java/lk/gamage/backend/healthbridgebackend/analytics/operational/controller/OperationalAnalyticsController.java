package lk.gamage.backend.healthbridgebackend.analytics.operational.controller;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsErrorResponse;
import lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response.OperationalAnalyticsResponse;
import lk.gamage.backend.healthbridgebackend.analytics.operational.service.OperationalAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics/operational")
@CrossOrigin(origins = "http://localhost:3000")
public class OperationalAnalyticsController {

    private final OperationalAnalyticsService operationalAnalyticsService;

    public OperationalAnalyticsController(OperationalAnalyticsService operationalAnalyticsService) {
        this.operationalAnalyticsService = operationalAnalyticsService;
    }

    @GetMapping
    public OperationalAnalyticsResponse getOperationalAnalytics(
            @RequestParam(defaultValue = "month") String period
    ) {
        return operationalAnalyticsService.getOperationalAnalytics(period);
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
