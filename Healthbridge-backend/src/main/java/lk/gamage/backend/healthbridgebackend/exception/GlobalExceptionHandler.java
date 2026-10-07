package lk.gamage.backend.healthbridgebackend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lk.gamage.backend.healthbridgebackend.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDto error = ErrorResponseDto.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleAlreadyExists(AlreadyExistsException ex, HttpServletRequest request) {
        ErrorResponseDto error = ErrorResponseDto.builder()
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponseDto> handleConflict(ConflictException ex, HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponseDto> handleBadRequest(Exception ex, HttpServletRequest request) {
        ErrorResponseDto error = ErrorResponseDto.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleForbidden(
            AccessDeniedException ex, HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN,
                "You do not have permission to access this resource.", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage()));
        String firstError = errors.isEmpty() ? "Validation failed" : errors.values().iterator().next();

        ErrorResponseDto error = ErrorResponseDto.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(firstError)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .errors(errors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex, HttpServletRequest request) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected server error occurred.", request);
        }

        private ResponseEntity<ErrorResponseDto> buildError(
            HttpStatus status, String message, HttpServletRequest request) {
        ErrorResponseDto error = ErrorResponseDto.builder()
            .status(status.value())
            .error(status.getReasonPhrase())
            .message(message)
            .path(request.getRequestURI())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(status).body(error);
    }
}
