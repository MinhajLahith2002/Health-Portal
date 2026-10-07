package lk.gamage.backend.healthbridgebackend.exception;

public class ResourceNotFoundException extends RuntimeException {

	public ResourceNotFoundException() {
		super();
	}

	public ResourceNotFoundException(String message) {
		super(message);
	}
}
