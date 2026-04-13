// ─── RideShare utility helpers ───────────────────────────────────────────────

import * as ImageManipulator from 'expo-image-manipulator';

// ─── Date / time ─────────────────────────────────────────────────────────────

/**
 * Format a date to a readable string.
 * Accepts both ISO strings and Date objects.
 * Optional `format`:
 *   'full'    → "15 Apr 2026"   (default)
 *   'short'   → "Apr 15"
 *   'numeric' → "15/04/2026"
 */
export function formatDate(
  date: string | Date,
  format: 'full' | 'short' | 'numeric' = 'full',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    case 'numeric':
      return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    default:
      return d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
  }
}

/**
 * Returns a relative time string.
 * @example
 * timeAgo('2026-04-13T10:00:00Z') // "2 min ago" | "Yesterday" | "3 days ago"
 */
export function timeAgo(date: string | Date): string {
  const d   = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diffMs  = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1_000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return 'Just now';
  if (diffMin < 60)  return `${diffMin} min ago`;
  if (diffHr  < 24)  return `${diffHr} hr ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay <  30) return `${diffDay} days ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} mo ago`;
  return `${Math.floor(diffDay / 365)} yr ago`;
}

/**
 * Returns true when the ISO date is in the past.
 */
export function isExpiredDate(date: string): boolean {
  return new Date(date).getTime() < Date.now();
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Format a 10-digit Indian phone number.
 * @example formatPhone('9876543210') // '+91 98765 43210'
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const ten    = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.slice(-10);
  if (ten.length !== 10) return phone;
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 * @example formatCurrency(1200) // '₹1,200'
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Strings ─────────────────────────────────────────────────────────────────

/**
 * First initials from a full name (up to 2).
 * @example getInitials('Vijay Kumar') // 'VK'
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// ─── Image ────────────────────────────────────────────────────────────────────

/**
 * Compress an image URI to max-width 800 / JPEG quality 0.8.
 * Returns the compressed file URI.
 */
export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}
