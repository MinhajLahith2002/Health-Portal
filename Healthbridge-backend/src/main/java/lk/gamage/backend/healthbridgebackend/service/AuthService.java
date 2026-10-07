package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.model.AuthProvider;
import lk.gamage.backend.healthbridgebackend.model.OtpToken;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.OtpTokenRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lk.gamage.backend.healthbridgebackend.security.CustomUserDetails;
import lk.gamage.backend.healthbridgebackend.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);


    @Value("${google.client.id:868011706916-4ck61kvgri6up58b8gj1c1lp1pmov3q0.apps.googleusercontent.com}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();
    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }


    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber().trim());
        String assignedRole = Role.PATIENT;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String requestedRole = request.getRole().trim().toUpperCase();
            if (Role.isValidRole(requestedRole)) {
                assignedRole = requestedRole;
            } else {
                throw new IllegalArgumentException("Invalid role: " + request.getRole() +
                        ". Allowed roles: " + String.join(", ", Role.ALL_ROLES));
            }
        }
        user.setRole(assignedRole);
        if (request.getBranch() != null && !request.getBranch().trim().isEmpty()) {
            user.setBranch(request.getBranch().trim());
        }
        user.setProvider(AuthProvider.LOCAL);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails, savedUser.getRole(), savedUser.getFullName(), savedUser.getId());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userOptional.get();

        if (user.getProvider() == AuthProvider.GOOGLE && (user.getPassword() == null || user.getPassword().isEmpty())) {
            throw new IllegalArgumentException("This account is registered via Google. Please log in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails, user.getRole(), user.getFullName(), user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                "Login successful"
        );
    }

    public java.util.Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        log.info("[Forgot Password] Request received for email: {}", normalizedEmail);

        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
        if (userOptional.isEmpty()) {
            log.warn("[Forgot Password] No account found with email: {}", normalizedEmail);
            throw new IllegalArgumentException("No account found with this email address");
        }

        // Invalidate previous unused OTP tokens for this email
        List<OtpToken> oldTokens = otpTokenRepository.findAllByEmailIgnoreCaseAndUsedFalse(normalizedEmail);
        for (OtpToken token : oldTokens) {
            token.setUsed(true);
        }
        otpTokenRepository.saveAll(oldTokens);

        // Generate 6-digit OTP
        int otpCode = 100000 + secureRandom.nextInt(900000);
        String otpString = String.valueOf(otpCode);

        OtpToken otpToken = new OtpToken(
                normalizedEmail,
                otpString,
                LocalDateTime.now().plusMinutes(10)
        );
        otpTokenRepository.save(otpToken);
        log.info("[Forgot Password] Generated OTP: {} for email: {}, expiresAt: {}", otpString, normalizedEmail, otpToken.getExpiresAt());

        // Dispatch Email
        boolean emailSent = emailService.sendOtpEmail(normalizedEmail, otpString);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("otp", otpString);
        result.put("emailSent", emailSent);
        result.put("message", emailSent
                ? "Verification code has been sent to your email"
                : "Verification code generated (Email service daily limit reached; use development code)");
        return result;
    }

    public boolean verifyOtp(OtpVerifyRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        String submittedOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        log.info("[OTP Verification] Attempting verification for email: '{}', OTP: '{}'", normalizedEmail, submittedOtp);

        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailIgnoreCaseAndOtpAndUsedFalse(
                normalizedEmail,
                submittedOtp
        );

        if (tokenOpt.isEmpty()) {
            log.warn("[OTP Verification] No matching unused token found for email: '{}' and OTP: '{}'", normalizedEmail, submittedOtp);
            throw new IllegalArgumentException("Invalid verification code");
        }

        OtpToken token = tokenOpt.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("[OTP Verification] Token for email: '{}' expired at: {}", normalizedEmail, token.getExpiresAt());
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        log.info("[OTP Verification] OTP '{}' successfully verified for email: '{}'", submittedOtp, normalizedEmail);
        return true;
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        String submittedOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        log.info("[Reset Password] Request received for email: {}, OTP: {}", normalizedEmail, submittedOtp);

        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Verify OTP
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmailIgnoreCaseAndOtpAndUsedFalse(
                normalizedEmail,
                submittedOtp
        );

        if (tokenOpt.isEmpty()) {
            log.warn("[Reset Password] Invalid OTP for email: {}", normalizedEmail);
            throw new IllegalArgumentException("Invalid verification code");
        }

        OtpToken token = tokenOpt.get();
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("[Reset Password] Expired OTP for email: {}", normalizedEmail);
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        // Mark OTP as used
        token.setUsed(true);
        otpTokenRepository.save(token);

        // Update User password
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("[Reset Password] Successfully updated password for user: {}", normalizedEmail);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails, user.getRole(), user.getFullName(), user.getId());

        return new AuthResponse(

                jwtToken,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                "Password has been reset successfully"
        );
    }

    public AuthResponse googleAuth(GoogleAuthRequest request) {
        String token = request.getToken();
        String verifiedEmail = null;
        String verifiedName = null;
        String googleSub = null;
        String picture = null;

        if (token != null && !token.isBlank()) {
            boolean isIdToken = token.contains(".") && !token.startsWith("ya29.");
            if (isIdToken) {
                // Attempt 1: Verify as ID Token via Google tokeninfo endpoint
                try {
                    String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
                    Map<?, ?> response = restTemplate.getForObject(tokenInfoUrl, Map.class);
                    if (response != null && response.containsKey("email")) {
                        verifiedEmail = (String) response.get("email");
                        verifiedName = (String) response.get("name");
                        googleSub = (String) response.get("sub");
                        picture = (String) response.get("picture");
                    }
                } catch (Exception e) {
                    log.warn("Failed to verify as Google ID token: {}", e.getMessage());
                }
            }

            if (verifiedEmail == null) {
                // Attempt 2: Verify as Access Token via Google userinfo endpoint
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setBearerAuth(token);
                    HttpEntity<?> entity = new HttpEntity<>(headers);
                    ResponseEntity<Map> userinfoResponse = restTemplate.exchange(
                            "https://www.googleapis.com/oauth2/v3/userinfo",
                            HttpMethod.GET,
                            entity,
                            Map.class
                    );
                    Map<?, ?> body = userinfoResponse.getBody();
                    if (body != null && body.containsKey("email")) {
                        verifiedEmail = (String) body.get("email");
                        verifiedName = (String) body.get("name");
                        googleSub = (String) body.get("sub");
                        picture = (String) body.get("picture");
                    }
                } catch (Exception ex) {
                    log.warn("Failed to verify via Google userinfo: {}", ex.getMessage());
                    // Fallback to client-provided email/name if provided
                    if (request.getEmail() != null && !request.getEmail().isBlank()) {
                        verifiedEmail = request.getEmail();
                        verifiedName = request.getName();
                        googleSub = token;
                    } else {
                        throw new IllegalArgumentException("Unable to verify Google token: " + ex.getMessage());
                    }
                }
            }
        }

        if (verifiedEmail == null || verifiedEmail.isBlank()) {
            if (request.getEmail() != null && !request.getEmail().isBlank()) {
                verifiedEmail = request.getEmail();
                verifiedName = request.getName();
                googleSub = token;
            } else {
                throw new IllegalArgumentException("Could not obtain email from Google authentication");
            }
        }

        String email = verifiedEmail.toLowerCase().trim();
        String name = (verifiedName != null && !verifiedName.isBlank()) ? verifiedName.trim() : "Google User";

        // Find existing patient profile linked to this Gmail (or Google ID)
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() && googleSub != null) {
            userOpt = userRepository.findByGoogleId(googleSub);
        }

        User user;

        if (userOpt.isPresent()) {
            // Returning user - maintain their existing profile and details!
            user = userOpt.get();
            boolean updated = false;

            if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
                user.setGoogleId(googleSub);
                updated = true;
            }
            if (user.getProvider() == null) {
                user.setProvider(AuthProvider.GOOGLE);
                updated = true;
            }
            if (picture != null && (user.getPicture() == null || user.getPicture().isBlank())) {
                user.setPicture(picture);
                updated = true;
            }

            if (updated) {
                user.setUpdatedAt(LocalDateTime.now());
                user = userRepository.save(user);
            }
        } else {
            // First time Google login - create a new persistent patient profile
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setPhoneNumber("");
            user.setRole(Role.PATIENT); // Every Google sign-in is defaulted to PATIENT
            user.setProvider(AuthProvider.GOOGLE);
            user.setGoogleId(googleSub != null ? googleSub : token);
            user.setPicture(picture);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user = userRepository.save(user);
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails, user.getRole(), user.getFullName(), user.getId());

        return new AuthResponse(
                jwtToken,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                "Google authentication successful"
        );
    }
}