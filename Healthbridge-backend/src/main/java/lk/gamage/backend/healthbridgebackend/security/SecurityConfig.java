package lk.gamage.backend.healthbridgebackend.security;

import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import lk.gamage.backend.healthbridgebackend.dto.ErrorResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, CorsConfigurationSource corsConfigurationSource,
            ObjectMapper objectMapper) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/doctor-sessions/**",
                                "/api/departments/**",
                                "/api/beds/**",
                                "/api/staff/**",
                                "/api/equipment/**",
                                "/api/hospital-admin/**",
                                "/error",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/api/diagnoses/**",
                                "/api/treatments/**",
                                "/api/contacts/**",
                                "/api/sos/**",
                                "/api/tickets/feedback/public",
                                "/ws/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/branches", "/api/branches/**").permitAll()
                        .requestMatchers("/api/appointments/**", "/api/doctor-sessions/**").authenticated()
                        .requestMatchers("/api/lab/results/patient/**").authenticated()
                        .requestMatchers("/api/lab/**").hasAnyRole("LAB_OFFICER", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(
                                "/api/medical-records/**",
                                "/api/medical-documents/**"
                        ).hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write(objectMapper.writeValueAsString(
                                    ErrorResponseDto.builder()
                                            .status(HttpServletResponse.SC_UNAUTHORIZED)
                                            .error("Unauthorized")
                                            .message("Authentication is required to access this resource.")
                                            .path(request.getRequestURI())
                                            .timestamp(LocalDateTime.now())
                                            .build()
                            ));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(objectMapper.writeValueAsString(
                                    ErrorResponseDto.builder()
                                            .status(HttpServletResponse.SC_FORBIDDEN)
                                            .error("Forbidden")
                                            .message("You do not have permission to access this resource.")
                                            .path(request.getRequestURI())
                                            .timestamp(LocalDateTime.now())
                                            .build()
                            ));
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
