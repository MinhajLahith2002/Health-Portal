package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.controller;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsErrorResponse;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response.PopulationHealthAnalyticsResponse;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.service.PopulationHealthAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics/population-health")
@CrossOrigin(origins = "http://localhost:3000")
public class PopulationHealthAnalyticsController {

    private final PopulationHealthAnalyticsService populationHealthAnalyticsService;

    public PopulationHealthAnalyticsController(PopulationHealthAnalyticsService populationHealthAnalyticsService) {
        this.populationHealthAnalyticsService = populationHealthAnalyticsService;
    }

    @GetMapping
    public PopulationHealthAnalyticsResponse getPopulationHealthAnalytics(
            @RequestParam(defaultValue = "month") String period
    ) {
        return populationHealthAnalyticsService.getPopulationHealthAnalytics(period);
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
