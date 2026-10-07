package lk.gamage.backend.healthbridgebackend.exception;

public class RiskScoreCalculationException extends RuntimeException {
    public RiskScoreCalculationException(String message) {
        super(message);
    }

    public RiskScoreCalculationException(String message, Throwable cause) {
        super(message, cause);
    }
}
