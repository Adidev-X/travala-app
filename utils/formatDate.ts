/**
 * Format an ISO date string to human-readable form.
 *
 * @example
 * formatDate('2026-04-15') // "15 Apr 2026"
 * formatDate('2026-04-15', 'short') // "Apr 15"
 */
export function formatDate(
  isoString: string,
  style: 'full' | 'short' | 'numeric' = 'full',
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';

  switch (style) {
    case 'short':
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    case 'numeric':
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    case 'full':
    default:
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
  }
}

/**
 * Returns a relative label like "Today", "Tomorrow", or formatted date.
 */
export function relativeDateLabel(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();

  const diffDays = Math.round(
    (target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return formatDate(isoString);
}
