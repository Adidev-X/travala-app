const colors = {
  // Brand
  primary: '#1F4E79',
  secondary: '#2E75B6',

  // Semantic
  success: '#1E6B3C',
  danger: '#C0392B',
  warning: '#C55A11',

  // Backgrounds
  background: '#F8F9FA',
  card: '#FFFFFF',

  // Text
  text: {
    primary: '#1A1A2E',
    secondary: '#4A4A68',
    hint: '#9E9EBD',
  },

  // Border
  border: '#E0E0E0',

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Status chips
  statusPending: '#FFF3CD',
  statusPendingText: '#856404',
  statusAccepted: '#D4EDDA',
  statusAcceptedText: '#155724',
  statusDeclined: '#F8D7DA',
  statusDeclinedText: '#721C24',
} as const;

export type ColorKey = keyof typeof colors;
export default colors;
