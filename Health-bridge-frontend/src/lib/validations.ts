export const emailSchema = {
  required: "Email is required",
  invalid: "Please enter a valid email address",
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const phoneSchema = {
  required: "Phone number is required",
  invalid: "Please enter a valid phone number",
  pattern: /^\+?[0-9\s()-]{8,20}$/,
};

export const nicSchema = {
  required: "NIC is required",
  invalid: "Please enter a valid Sri Lankan NIC",
  pattern: /^(?:\d{9}[VvXx]|\d{12})$/,
};

export const passwordSchema = {
  required: "Password is required",
  minLength: 8,
  message: "Password must be at least 8 characters long",
};

export const requiredField = (fieldName: string) => `${fieldName} is required`;

export const validateEmail = (email: string): string | null => {
  const value = email.trim();
  if (!value) return emailSchema.required;
  if (!emailSchema.pattern.test(value)) return emailSchema.invalid;
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const value = phone.trim();
  if (!value) return phoneSchema.required;
  if (!phoneSchema.pattern.test(value)) return phoneSchema.invalid;
  return null;
};

export const validateNic = (nic: string): string | null => {
  const value = nic.trim();
  if (!value) return nicSchema.required;
  if (!nicSchema.pattern.test(value)) return nicSchema.invalid;
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return passwordSchema.required;
  if (password.length < passwordSchema.minLength) return passwordSchema.message;
  return null;
};

export const validateMatch = (value: string, confirmValue: string, label = "Password"): string | null => {
  if (!value) return requiredField(label);
  if (value !== confirmValue) return `${label} confirmation does not match`;
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) return requiredField(fieldName);
  return null;
};
