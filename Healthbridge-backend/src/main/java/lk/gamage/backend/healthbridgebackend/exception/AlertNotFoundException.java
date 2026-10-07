package lk.gamage.backend.healthbridgebackend.exception;

public class AlertNotFoundException extends RuntimeException {
    public AlertNotFoundException(String message) {
        super(message);
    }

    public AlertNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
