/**
 * Truncates text to a maximum length and appends an ellipsis.
 *
 * @param text     — original string
 * @param maxLen   — max character length before truncation (default 80)
 * @param suffix   — appended when truncated (default '…')
 *
 * @example
 * truncateText('A very long trip description here', 20) // 'A very long trip des…'
 */
export function truncateText(
  text: string,
  maxLen: number = 80,
  suffix: string = '…',
): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - suffix.length).trimEnd() + suffix;
}

/**
 * Capitalises the first letter of each word.
 *
 * @example
 * titleCase('new delhi') // 'New Delhi'
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
