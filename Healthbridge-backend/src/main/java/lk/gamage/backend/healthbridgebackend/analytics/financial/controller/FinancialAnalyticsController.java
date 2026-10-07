package lk.gamage.backend.healthbridgebackend.analytics.financial.controller;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.AnalyticsErrorResponse;
import lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response.FinancialAnalyticsResponse;
import lk.gamage.backend.healthbridgebackend.analytics.financial.service.FinancialAnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics/financial")
@CrossOrigin(origins = "http://localhost:3000")
public class FinancialAnalyticsController {

    private final FinancialAnalyticsService financialAnalyticsService;

    public FinancialAnalyticsController(FinancialAnalyticsService financialAnalyticsService) {
        this.financialAnalyticsService = financialAnalyticsService;
    }

    @GetMapping
    public FinancialAnalyticsResponse getFinancialAnalytics(
            @RequestParam(defaultValue = "month") String period
    ) {
        return financialAnalyticsService.getFinancialAnalytics(period);
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
