import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateMatch,
  validateNic,
  validatePassword,
  validatePhone,
  validateRequired,
} from "@/lib/validations";

describe("shared validation helpers", () => {
  it("accepts valid email, phone, and Sri Lankan NIC values", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validatePhone("+94 77 123 4567")).toBeNull();
    expect(validateNic("991234567V")).toBeNull();
  });

  it("returns useful errors for invalid required fields", () => {
    expect(validateRequired("", "Name")).toBe("Name is required");
    expect(validateEmail("invalid")).toBe("Please enter a valid email address");
    expect(validatePassword("short")).toBe("Password must be at least 8 characters long");
  });

  it("detects confirmation mismatches", () => {
    expect(validateMatch("secret", "different")).toBe("Password confirmation does not match");
    expect(validateMatch("secret", "secret")).toBeNull();
  });
});