package lk.gamage.backend.healthbridgebackend.util;

import lk.gamage.backend.healthbridgebackend.common.Constants;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;

import java.util.regex.Pattern;

public class ValidationUtil {

	private static final Pattern EMAIL_PATTERN = Pattern.compile(Constants.ValidationPatterns.EMAIL_PATTERN);
	private static final Pattern PHONE_PATTERN = Pattern.compile(Constants.ValidationPatterns.PHONE_PATTERN);
	private static final Pattern NIC_PATTERN = Pattern.compile(Constants.ValidationPatterns.NIC_PATTERN);
	private static final Pattern STRONG_PASSWORD_PATTERN =
			Pattern.compile(Constants.ValidationPatterns.STRONG_PASSWORD_PATTERN);

	private ValidationUtil() {
	}

	public static boolean isValidEmail(String value) {
		return value != null && EMAIL_PATTERN.matcher(value.trim()).matches();
	}

	public static boolean isValidPhone(String value) {
		return value != null && PHONE_PATTERN.matcher(value.trim()).matches();
	}

	public static boolean isValidNic(String value) {
		return value != null && NIC_PATTERN.matcher(value.trim()).matches();
	}

	public static boolean isStrongPassword(String value) {
		return value != null && STRONG_PASSWORD_PATTERN.matcher(value).matches();
	}

	public static String requireNotBlank(String value, String fieldName) {
		if (value == null || value.isBlank()) {
			throw new BadRequestException(fieldName + " is required");
		}
		return value.trim();
	}

	public static String requireValidEmail(String value, String fieldName) {
		String normalizedValue = requireNotBlank(value, fieldName);
		if (!isValidEmail(normalizedValue)) {
			throw new BadRequestException(Constants.ValidationMessages.INVALID_EMAIL);
		}
		return normalizedValue;
	}

	public static String requireValidPhone(String value, String fieldName) {
		String normalizedValue = requireNotBlank(value, fieldName);
		if (!isValidPhone(normalizedValue)) {
			throw new BadRequestException(Constants.ValidationMessages.INVALID_PHONE);
		}
		return normalizedValue;
	}
}
