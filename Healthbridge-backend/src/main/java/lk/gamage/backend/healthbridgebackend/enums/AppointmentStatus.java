package lk.gamage.backend.healthbridgebackend.enums;

public enum AppointmentStatus {
    BOOKED,
    UPCOMING,
    COMPLETED,
    CANCELLED,
    NO_SHOW;

    public boolean isActive() {
        return this == BOOKED || this == UPCOMING;
    }
}
