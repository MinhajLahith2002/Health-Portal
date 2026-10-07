package lk.gamage.backend.healthbridgebackend.config;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CorsConfigTest {

    @Test
    void usesConfiguredOrigins() {
        CorsConfigurationSource source = new CorsConfig()
                .corsConfigurationSource("https://app.example.com, http://localhost:3000");

        HttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        CorsConfiguration configuration = source.getCorsConfiguration(request);

        assertNotNull(configuration);
        assertEquals(
                java.util.List.of("https://app.example.com", "http://localhost:3000"),
                configuration.getAllowedOrigins());
        assertEquals(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"),
                configuration.getAllowedMethods());
    }
}
