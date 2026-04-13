/** Matches Indian 10-digit mobile numbers (optionally prefixed with +91 or 0) */
const INDIAN_PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

/**
 * Validates an Indian phone number.
 * Strips spaces/dashes before checking.
 *
 * @returns true if valid
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-]/g, '');
  return INDIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Normalises a phone number to a plain 10-digit string.
 *
 * @example
 * normalisePhone('+919876543210') // '9876543210'
 */
export function normalisePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (cleaned.startsWith('+91')) return cleaned.slice(3);
  if (cleaned.startsWith('0')) return cleaned.slice(1);
  return cleaned;
}
