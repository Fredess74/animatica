/**
 * Animatica Design Tokens — Engine Constants
 *
 * Philosophy: "Retro Futurism 71"
 * Palette: Green + White + Black only
 *
 * Reference: 1971-style parallel green stripe poster
 * Note: These values must mirror packages/editor/src/styles/design-tokens.css
 */

export const DesignTokens = {
  // Green Spectrum
  green: {
    950: '#052E1A',
    900: '#0A5C36',
    800: '#0D7A48',
    700: '#15803D',
    600: '#16A34A', // PRIMARY
    500: '#22C55E',
    400: '#4ADE80',
    300: '#86EFAC',
    200: '#BBF7D0',
  },
  // Black Spectrum
  bg: {
    deep: '#0A0A0A',
    base: '#111111',
    surface: '#1A1A1A',
    elevated: '#222222',
    overlay: '#2A2A2A',
  },
  // White Spectrum
  text: {
    primary: '#F5F5F0',
    secondary: '#A3A3A3',
    muted: '#737373',
    disabled: '#525252',
    inverse: '#0A0A0A',
  },
  // Semantic Colors
  color: {
    primary: '#16A34A',
    primaryHover: '#22C55E',
    primaryActive: '#15803D',
    primaryMuted: '#0A5C36',
    primaryGlow: 'rgba(22, 163, 74, 0.25)',
    success: '#4ADE80',
    error: '#EF4444',
    errorMuted: '#7F1D1D',
  },
} as const;
