package lk.gamage.backend.healthbridgebackend.service;

public class InvalidSessionStateException extends RuntimeException {
    public InvalidSessionStateException(String message) {
        super(message);
    }
}
