package lk.gamage.backend.healthbridgebackend.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API Response wrapper for all successful responses.
 * Used across all controllers to maintain consistent response format.
 * 
 * Example:
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "Operation successful",
 *   "statusCode": 200,
 *   "timestamp": "2026-08-31T10:30:00"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private T data;
    private String message;
    private int statusCode;
    private LocalDateTime timestamp;
    
    /**
     * Build a successful response with data
     */
    public static <T> ApiResponse<T> success(T data, String message, int statusCode) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .statusCode(statusCode)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Build a successful response with data (default HTTP 200)
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return success(data, message, 200);
    }
    
    /**
     * Build a successful response (no data, default HTTP 200)
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .statusCode(200)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Build a response with custom status code
     */
    public static <T> ApiResponse<T> of(T data, String message, int statusCode) {
        return success(data, message, statusCode);
    }

    /**
     * Build an error response with data
     */
    public static <T> ApiResponse<T> error(T data, String message, int statusCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .data(data)
                .message(message)
                .statusCode(statusCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Build an error response (no data)
     */
    public static <T> ApiResponse<T> error(String message, int statusCode) {
        return error(null, message, statusCode);
    }
}
