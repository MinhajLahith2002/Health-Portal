package lk.gamage.backend.healthbridgebackend.util;

import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ValidationUtilTest {

    @Test
    void validatesSharedInputFormats() {
        assertTrue(ValidationUtil.isValidEmail("person@example.com"));
        assertTrue(ValidationUtil.isValidPhone("0712345678"));
        assertTrue(ValidationUtil.isValidNic("901234567V"));
        assertTrue(ValidationUtil.isStrongPassword("Password1!"));
    }

    @Test
    void rejectsInvalidSharedInputFormats() {
        assertFalse(ValidationUtil.isValidEmail("invalid-email"));
        assertFalse(ValidationUtil.isValidPhone("123"));
        assertFalse(ValidationUtil.isValidNic("not-a-nic"));
        assertFalse(ValidationUtil.isStrongPassword("password"));
    }

    @Test
    void normalizesRequiredValues() {
        assertEquals("person@example.com",
                ValidationUtil.requireValidEmail(" person@example.com ", "Email"));
    }

    @Test
    void rejectsMissingRequiredValues() {
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> ValidationUtil.requireNotBlank(" ", "Name"));

        assertEquals("Name is required", exception.getMessage());
    }

    @Test
    void rejectsInvalidRequiredFormats() {
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> ValidationUtil.requireValidEmail("invalid-email", "Email"));

        assertEquals("Invalid email format", exception.getMessage());
    }
}