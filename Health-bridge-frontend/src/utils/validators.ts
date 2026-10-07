// src/utils/validators.ts
// Reusable field-level validators for Developer 02 (User Profile & Account)

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const ADDRESS_MIN_LENGTH = 10;
export const ADDRESS_MAX_LENGTH = 200;

// Sri Lankan mobile/landline: 07XXXXXXXX, +947XXXXXXXX, or 0 + 9 digit landline
const SL_PHONE_REGEX = /^(?:\+94|0)(7\d{8}|[1-9]\d{8})$/;

// Letters (incl. Sinhala unicode block), spaces, apostrophes, hyphens
const NAME_REGEX = /^[A-Za-z\u0D80-\u0DFF\s.'-]+$/;

export function validateFullName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < NAME_MIN_LENGTH)
    return `Full name must be at least ${NAME_MIN_LENGTH} characters.`;
  if (trimmed.length > NAME_MAX_LENGTH)
    return `Full name cannot exceed ${NAME_MAX_LENGTH} characters.`;
  if (!NAME_REGEX.test(trimmed))
    return "Full name can only contain letters, spaces, apostrophes and hyphens.";
  return "";
}

export function validatePhoneNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";
  if (!/^[0-9+]+$/.test(trimmed))
    return "Phone number can only contain digits and an optional leading +.";
  if (!SL_PHONE_REGEX.test(trimmed))
    return "Enter a valid Sri Lankan phone number (e.g. 0771234567).";
  return "";
}

export function validateDateOfBirth(value: string): string {
  if (!value) return "Date of birth is required.";
  const dob = new Date(value);
  const today = new Date();
  if (isNaN(dob.getTime())) return "Enter a valid date.";
  if (dob > today) return "Date of birth cannot be in the future.";

  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  if (age < 0 || age > 120) return "Enter a realistic date of birth.";
  if (age < 13) return "User must be at least 13 years old.";

  return "";
}

export function validateGender(value: string): string {
  if (!value) return "Please select a gender.";
  return "";
}

export function validateBloodGroup(value: string, required: boolean): string {
  if (required && !value) return "Please select a blood group.";
  return "";
}

export function validateAddress(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Address is required.";
  if (trimmed.length < ADDRESS_MIN_LENGTH)
    return `Address must be at least ${ADDRESS_MIN_LENGTH} characters.`;
  if (trimmed.length > ADDRESS_MAX_LENGTH)
    return `Address cannot exceed ${ADDRESS_MAX_LENGTH} characters.`;
  return "";
} 