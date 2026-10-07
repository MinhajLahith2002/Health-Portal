package lk.gamage.backend.healthbridgebackend.util;

import lk.gamage.backend.healthbridgebackend.security.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Shared JWT facade for modules that depend on the common utility layer. */
@Component
public class JwtUtil {

	private final JwtService jwtService;

	public JwtUtil(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	public String extractUsername(String token) {
		return jwtService.extractUsername(token);
	}

	public String generateToken(UserDetails userDetails, String role, String fullName, String id) {
		return jwtService.generateToken(userDetails, role, fullName, id);
	}

	public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
		return jwtService.generateToken(extraClaims, userDetails);
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		return jwtService.isTokenValid(token, userDetails);
	}
}
