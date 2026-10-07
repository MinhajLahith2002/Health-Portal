package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

    @NotBlank(message = "Token is required")
    private String token;

    private String email;
    private String name;

    public GoogleAuthRequest() {
    }

    public GoogleAuthRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
