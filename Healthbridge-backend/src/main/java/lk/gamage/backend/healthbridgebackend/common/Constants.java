package lk.gamage.backend.healthbridgebackend.common;

/**
 * System-wide constants used across all modules.
 * Developer 20 maintains this file for cross-module consistency.
 */
public class Constants {
    
    // ============= HTTP STATUS MESSAGES =============
    public static class HttpStatus {
        public static final String SUCCESS = "Success";
        public static final String CREATED = "Resource created successfully";
        public static final String UPDATED = "Resource updated successfully";
        public static final String DELETED = "Resource deleted successfully";
        public static final String NO_CONTENT = "No content";
    }
    
    // ============= VALIDATION MESSAGES =============
    public static class ValidationMessages {
        public static final String FIELD_REQUIRED = "This field is required";
        public static final String INVALID_EMAIL = "Invalid email format";
        public static final String INVALID_PHONE = "Invalid phone number format";
        public static final String PASSWORD_MIN_LENGTH = "Password must be at least 8 characters";
        public static final String PASSWORD_MISMATCH = "Passwords do not match";
        public static final String INVALID_LENGTH = "Length must be between %d and %d characters";
        public static final String INVALID_NUMBER_RANGE = "Value must be between %d and %d";
        public static final String INVALID_DATE_FORMAT = "Invalid date format. Use yyyy-MM-dd";
        public static final String FUTURE_DATE_NOT_ALLOWED = "Future date is not allowed";
        public static final String PAST_DATE_NOT_ALLOWED = "Past date is not allowed";
    }
    
    // ============= ERROR MESSAGES =============
    public static class ErrorMessages {
        public static final String RESOURCE_NOT_FOUND = "Resource not found";
        public static final String RESOURCE_ALREADY_EXISTS = "Resource already exists";
        public static final String UNAUTHORIZED = "Unauthorized access";
        public static final String FORBIDDEN = "Access forbidden";
        public static final String INVALID_CREDENTIALS = "Invalid username or password";
        public static final String INVALID_TOKEN = "Invalid or expired token";
        public static final String TOKEN_EXPIRED = "Token has expired";
        public static final String INVALID_REQUEST = "Invalid request";
        public static final String INTERNAL_SERVER_ERROR = "An unexpected server error occurred";
        public static final String SERVICE_UNAVAILABLE = "Service temporarily unavailable";
        public static final String BAD_REQUEST = "Bad request";
        public static final String CONFLICT = "Resource conflict";
        public static final String INVALID_OPERATION = "Invalid operation";
    }
    
    // ============= PAGINATION DEFAULTS =============
    public static class Pagination {
        public static final int DEFAULT_PAGE = 0;
        public static final int DEFAULT_PAGE_SIZE = 10;
        public static final int MAX_PAGE_SIZE = 100;
        public static final int MIN_PAGE_SIZE = 1;
    }
    
    // ============= USER ROLES & PERMISSIONS =============
    public static class Roles {
        public static final String ADMIN = "ROLE_ADMIN";
        public static final String DOCTOR = "ROLE_DOCTOR";
        public static final String PATIENT = "ROLE_PATIENT";
        public static final String PHARMACIST = "ROLE_PHARMACIST";
        public static final String LAB_TECHNICIAN = "ROLE_LAB_TECHNICIAN";
        public static final String NURSE = "ROLE_NURSE";
        public static final String HOSPITAL_ADMIN = "ROLE_HOSPITAL_ADMIN";
        public static final String INSURANCE_ADMIN = "ROLE_INSURANCE_ADMIN";
    }
    
    public static class Permissions {
        public static final String READ = "read";
        public static final String CREATE = "create";
        public static final String UPDATE = "update";
        public static final String DELETE = "delete";
        public static final String APPROVE = "approve";
        public static final String REJECT = "reject";
    }
    
    // ============= API ENDPOINTS =============
    public static class ApiEndpoints {
        public static final String API_V1 = "/api/v1";
        public static final String AUTH = API_V1 + "/auth";
        public static final String USERS = API_V1 + "/users";
        public static final String DOCTORS = API_V1 + "/doctors";
        public static final String PATIENTS = API_V1 + "/patients";
        public static final String APPOINTMENTS = API_V1 + "/appointments";
        public static final String PRESCRIPTIONS = API_V1 + "/prescriptions";
        public static final String MEDICATIONS = API_V1 + "/medications";
        public static final String MEDICAL_RECORDS = API_V1 + "/medical-records";
        public static final String LABORATORIES = API_V1 + "/laboratories";
        public static final String LAB_TESTS = API_V1 + "/lab-tests";
        public static final String HOSPITALS = API_V1 + "/hospitals";
        public static final String INSURANCE = API_V1 + "/insurance";
        public static final String PAYMENTS = API_V1 + "/payments";
        public static final String ADMIN = API_V1 + "/admin";
        public static final String NOTIFICATIONS = API_V1 + "/notifications";
        public static final String DASHBOARD = API_V1 + "/dashboard";
        public static final String ANALYTICS = API_V1 + "/analytics";
    }
    
    // ============= ERROR CODES =============
    public static class ErrorCodes {
        public static final String ERR_INVALID_INPUT = "ERR_001";
        public static final String ERR_RESOURCE_NOT_FOUND = "ERR_002";
        public static final String ERR_RESOURCE_EXISTS = "ERR_003";
        public static final String ERR_UNAUTHORIZED = "ERR_004";
        public static final String ERR_FORBIDDEN = "ERR_005";
        public static final String ERR_INVALID_CREDENTIALS = "ERR_006";
        public static final String ERR_TOKEN_INVALID = "ERR_007";
        public static final String ERR_TOKEN_EXPIRED = "ERR_008";
        public static final String ERR_SERVER_ERROR = "ERR_999";
    }
    
    // ============= DATE FORMATS =============
    public static class DateFormats {
        public static final String DATE_PATTERN = "yyyy-MM-dd";
        public static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
        public static final String TIME_PATTERN = "HH:mm:ss";
        public static final String ISO_8601_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
    }
    
    // ============= TOKEN CONFIGURATION =============
    public static class Token {
        public static final String TOKEN_TYPE = "Bearer";
        public static final String AUTHORIZATION_HEADER = "Authorization";
        public static final String TOKEN_PREFIX = "Bearer ";
    }
    
    // ============= HTTP STATUS CODES =============
    public static class HttpStatusCodes {
        public static final int OK = 200;
        public static final int CREATED = 201;
        public static final int ACCEPTED = 202;
        public static final int NO_CONTENT = 204;
        public static final int BAD_REQUEST = 400;
        public static final int UNAUTHORIZED = 401;
        public static final int FORBIDDEN = 403;
        public static final int NOT_FOUND = 404;
        public static final int CONFLICT = 409;
        public static final int UNPROCESSABLE_ENTITY = 422;
        public static final int INTERNAL_SERVER_ERROR = 500;
        public static final int SERVICE_UNAVAILABLE = 503;
    }
    
    // ============= CACHE KEYS =============
    public static class CacheKeys {
        public static final String USER_PREFIX = "user:";
        public static final String DOCTOR_PREFIX = "doctor:";
        public static final String PATIENT_PREFIX = "patient:";
        public static final String APPOINTMENT_PREFIX = "appointment:";
        public static final String PRESCRIPTION_PREFIX = "prescription:";
    }
    
    // ============= VALIDATION PATTERNS =============
    public static class ValidationPatterns {
        public static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
        public static final String PHONE_PATTERN = "^[0-9]{10,15}$";
        public static final String NIC_PATTERN = "^[0-9]{9}[vV]?$"; // Sri Lankan NIC
        public static final String STRONG_PASSWORD_PATTERN = 
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    }
    
    // ============= CONFIGURATION DEFAULTS =============
    public static class AppConfig {
        public static final int JWT_EXPIRATION_HOURS = 24;
        public static final int REFRESH_TOKEN_EXPIRATION_DAYS = 7;
        public static final int OTP_EXPIRATION_MINUTES = 5;
        public static final int MAX_LOGIN_ATTEMPTS = 5;
        public static final int LOCK_DURATION_MINUTES = 15;
    }
    
    // ============= FILE UPLOAD =============
    public static class FileUpload {
        public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        public static final String[] ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"};
        public static final String[] ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "doc", "docx", "xls", "xlsx"};
        public static final String[] ALLOWED_REPORT_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"};
    }
}
