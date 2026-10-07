package lk.gamage.backend.healthbridgebackend.enums;

public enum FraudAlertType {
    DUPLICATE_CLAIM("Duplicate Claim"),
    OVERBILLING("Overbilling"),
    HIGH_FREQUENCY("High Claim Frequency"),
    UNBILLED_PROCEDURE("Unbilled Procedure"),
    FALSE_HISTORY("False Medical History"),
    DOCUMENTATION_MISMATCH("Documentation Mismatch"),
    PHARMACY_ABUSE("Pharmacy Abuse"),
    UNUSUAL_DIAGNOSIS("Unusual Diagnosis"),
    MULTIPLE_PROVIDER_SAME_DATE("Multiple Providers Same Date"),
    EXCESSIVE_MEDICATION("Excessive Medication"),
    UNKNOWN("Unknown");

    private final String displayName;

    FraudAlertType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
