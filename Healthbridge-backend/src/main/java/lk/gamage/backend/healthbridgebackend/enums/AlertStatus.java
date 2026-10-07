package lk.gamage.backend.healthbridgebackend.enums;

public enum AlertStatus {
    PENDING("Pending Review"),
    UNDER_REVIEW("Under Review"),
    CONFIRMED_FRAUD("Confirmed Fraud"),
    FALSE_POSITIVE("False Positive"),
    RESOLVED("Resolved"),
    ESCALATED("Escalated to Authorities"),
    ARCHIVED("Archived");

    private final String displayName;

    AlertStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
