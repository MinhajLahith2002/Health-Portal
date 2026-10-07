package lk.gamage.backend.healthbridgebackend.service;

public class TelemedicineSessionNotFoundException extends RuntimeException {
    public TelemedicineSessionNotFoundException(String id) {
        super("Telemedicine session not found: " + id);
    }
}
