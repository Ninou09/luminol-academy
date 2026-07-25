export const colors = {
  ink: '#102A43',
  inkSoft: '#243B53',
  gold: '#C79A3B',
  goldStrong: '#8B651F',
  canvas: '#FAFAF8',
  surface: '#FFFFFF',
  muted: '#627D98',
  line: '#D9E2EC',
  success: '#277A53',
  danger: '#B42318',
  psychology: '#2F6B67',
  languages: '#375A7F',
  training: '#8A5A32',
} as const;

export const fonts = {
  sans: ['Manrope', 'system-ui', 'sans-serif'],
  display: ['Cormorant Garamond', 'Georgia', 'serif'],
  arabic: ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'sans-serif'],
} as const;

export const spacing = {
  page: 'clamp(1.25rem, 5vw, 5rem)',
  section: 'clamp(4rem, 9vw, 8rem)',
  content: '72rem',
  reading: '42rem',
} as const;

export const radii = {
  control: '0.375rem',
  card: '0.75rem',
  pill: '999px',
} as const;

export const shadows = {
  elevated: '0 1.25rem 3rem rgb(16 42 67 / 0.12)',
  focus: '0 0 0 3px rgb(199 154 59 / 0.35)',
} as const;

// Kept for compatibility with Milestone 1 imports.
export const brand = {
  navy: colors.ink,
  gold: colors.gold,
  canvas: colors.canvas,
} as const;
