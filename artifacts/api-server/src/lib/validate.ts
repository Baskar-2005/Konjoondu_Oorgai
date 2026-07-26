/**
 * Shared server-side validation helpers.
 * All validation is done here so it's consistent across every route.
 */

/** Indian mobile number: optional country code (+91), 10 digits starting with 6-9 */
export function isValidPhone(phone: string): boolean {
  return /^(\+91[-\s]?)?[6-9]\d{9}$/.test(phone.trim().replace(/\s+/g, ""));
}

/** Very permissive email check — catches obvious malformed values */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim());
}

/** Indian PIN code — exactly 6 digits */
export function isValidPincode(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

/** Strip characters that are meaningless/dangerous in plain-text fields */
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  // Trim, collapse internal whitespace runs, enforce max length
  return value.trim().replace(/\s+/g, " ").slice(0, maxLen);
}

/** Normalize a phone string (remove spaces, ensure +91 prefix is handled) */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

export const LIMITS = {
  NAME: 100,
  EMAIL: 200,
  PHONE: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  ADDRESS_LINE: 200,
  CITY: 100,
  STATE: 100,
  COUNTRY: 100,
  PINCODE: 10,
  REVIEW_TITLE: 200,
  REVIEW_BODY: 2000,
  ISSUE_DESC: 2000,
  COUPON_CODE: 50,
  PRODUCT_NAME: 200,
  GENERIC: 500,
} as const;
