package lk.gamage.backend.healthbridgebackend.enums;

public enum AlertSeverity {
    LOW("Low Risk", 1),
    MEDIUM("Medium Risk", 2),
    HIGH("High Risk", 3),
    CRITICAL("Critical Risk", 4);

    private final String displayName;
    private final Integer level;

    AlertSeverity(String displayName, Integer level) {
        this.displayName = displayName;
        this.level = level;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Integer getLevel() {
        return level;
    }
}
