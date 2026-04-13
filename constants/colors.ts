export const COLORS = {
  // Primary brand — deep blue (trustworthy, travel)
  primary: '#1A56DB',
  primaryLight: '#3B82F6',
  primaryBg: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // Accent — warm amber (energy, calls-to-action)
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  accentDark: '#D97706',

  // Success — fresh green (verified, confirmed)
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#065F46',

  // Danger — soft red
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#991B1B',

  // Warning — orange
  warning: '#F97316',
  warningLight: '#FFEDD5',

  // Neutral purple (full tour trips)
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',

  // WHITE BASE surfaces
  white: '#FFFFFF',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Slate scale (text + borders)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // Text semantic aliases
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    hint: '#94A3B8',
    inverse: '#FFFFFF',
    link: '#1A56DB',
    success: '#065F46',
    danger: '#991B1B',
  },

  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#1A56DB',

  // Special
  overlay: 'rgba(15,23,42,0.45)',
  shimmer: '#F1F5F9',

  // ── Legacy / semantic aliases (used by older screens) ──────────────────────
  secondary: '#475569',
  muted: '#94A3B8',
  card: '#FFFFFF',
  // Status chip tokens
  statusAccepted:     '#D1FAE5', // successLight
  statusAcceptedText: '#065F46', // successDark
  statusPending:      '#FEF3C7', // accentLight
  statusPendingText:  '#92400E', // amber-dark
  statusDeclined:     '#FEE2E2', // dangerLight
  statusDeclinedText: '#991B1B', // dangerDark
  statusDefault:      '#F1F5F9', // slate100
  statusDefaultText:  '#475569', // slate600
} as const;

export type Colors = typeof COLORS;

/** Default export — drop-in for `import colors from '@/constants/colors'` */
export default COLORS;
