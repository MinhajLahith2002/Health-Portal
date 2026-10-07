package lk.gamage.backend.healthbridgebackend.analytics.dto.response;

import java.time.Instant;

public record AnalyticsErrorResponse(Instant timestamp, int status, String error, String message) {
}
