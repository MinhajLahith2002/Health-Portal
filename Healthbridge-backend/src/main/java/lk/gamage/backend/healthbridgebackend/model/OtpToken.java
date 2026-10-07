package lk.gamage.backend.healthbridgebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otp_tokens")
public class OtpToken {

    @Id
    private String id;

    private String email;

    private String otp;

    private LocalDateTime expiresAt;

    private boolean used = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public OtpToken() {
    }

    public OtpToken(String email, String otp, LocalDateTime expiresAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.used = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
