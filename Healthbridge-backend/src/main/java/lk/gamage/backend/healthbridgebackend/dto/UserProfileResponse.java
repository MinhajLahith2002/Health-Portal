package lk.gamage.backend.healthbridgebackend.dto;

import lk.gamage.backend.healthbridgebackend.model.AuthProvider;
import lk.gamage.backend.healthbridgebackend.model.LocalizationPrefs;
import lk.gamage.backend.healthbridgebackend.model.NotificationPrefs;
import lk.gamage.backend.healthbridgebackend.model.PrivacyPrefs;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;

import java.time.LocalDateTime;

public class UserProfileResponse {

    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private AuthProvider provider;
    private String googleId;
    private String picture;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String branch;
    private String emergencyContact;
    private String medicalHistory;
    private java.util.List<String> allergies;
    private java.util.List<String> conditions;
    private String accountStatus;
    private boolean twoFactorEnabled;
    private NotificationPrefs notificationPrefs;
    private PrivacyPrefs privacyPrefs;
    private LocalizationPrefs localizationPrefs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserProfileResponse() {
    }

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.provider = user.getProvider();
        this.googleId = user.getGoogleId();
        this.picture = user.getPicture();
        this.dateOfBirth = user.getDateOfBirth();
        this.gender = user.getGender();
        this.bloodGroup = user.getBloodGroup();
        if (user.getBloodType() != null) this.bloodGroup = user.getBloodType(); // support both
        this.address = user.getAddress();
        this.branch = user.getBranch();
        this.emergencyContact = user.getEmergencyContact();
        this.medicalHistory = user.getMedicalHistory();
        this.allergies = user.getAllergies();
        this.conditions = user.getConditions();
        this.accountStatus = user.getAccountStatus();
        this.twoFactorEnabled = user.isTwoFactorEnabled();
        this.notificationPrefs = user.getNotificationPrefs();
        this.privacyPrefs = user.getPrivacyPrefs();
        this.localizationPrefs = user.getLocalizationPrefs();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public java.util.List<String> getAllergies() {
        return allergies;
    }

    public void setAllergies(java.util.List<String> allergies) {
        this.allergies = allergies;
    }

    public java.util.List<String> getConditions() {
        return conditions;
    }

    public void setConditions(java.util.List<String> conditions) {
        this.conditions = conditions;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public NotificationPrefs getNotificationPrefs() {
        return notificationPrefs;
    }

    public void setNotificationPrefs(NotificationPrefs notificationPrefs) {
        this.notificationPrefs = notificationPrefs;
    }

    public PrivacyPrefs getPrivacyPrefs() {
        return privacyPrefs;
    }

    public void setPrivacyPrefs(PrivacyPrefs privacyPrefs) {
        this.privacyPrefs = privacyPrefs;
    }

    public LocalizationPrefs getLocalizationPrefs() {
        return localizationPrefs;
    }

    public void setLocalizationPrefs(LocalizationPrefs localizationPrefs) {
        this.localizationPrefs = localizationPrefs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}