package lk.gamage.backend.healthbridgebackend.exception;

public class BadRequestException extends RuntimeException {

	public BadRequestException() {
		super();
	}

	public BadRequestException(String message) {
		super(message);
	}
}
