package lk.gamage.backend.healthbridgebackend.controller;

import jakarta.validation.Valid;
import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest().body(Map.of("message", "Validation failed", "errors", errors));
        }

        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during registration"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest().body(Map.of("message", "Validation failed", "errors", errors));
        }

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during login"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid email address"));
        }

        try {
            Map<String, Object> result = authService.forgotPassword(request);
            boolean emailSent = Boolean.TRUE.equals(result.get("emailSent"));
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", result.get("message"));
            resp.put("emailSent", emailSent);
            if (!emailSent && result.get("otp") != null) {
                resp.put("devOtp", result.get("otp"));
            }
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to send verification code at this time"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerifyRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a 6-digit verification code"));
        }

        try {
            boolean valid = authService.verifyOtp(request);
            return ResponseEntity.ok(Map.of("valid", valid, "message", "OTP verified successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("valid", false, "message", "Verification failed"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest().body(Map.of("message", "Validation failed", "errors", errors));
        }

        try {
            AuthResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Password reset failed"));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            AuthResponse response = authService.googleAuth(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google login failed: " + e.getMessage()));
        }
    }
}
