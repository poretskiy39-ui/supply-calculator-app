export type ThemeMode = 'dark' | 'swiss-light';

export const theme = {
  colors: {
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    surfaceLight: 'var(--color-surface-light)',
    accent: 'var(--color-accent)',
    accentHover: 'var(--color-accent-hover)',
    accent20: 'var(--color-accent-20)',
    accent30: 'var(--color-accent-30)',
    accent40: 'var(--color-accent-40)',
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    border: 'var(--color-border)',
    error: 'var(--color-error)',
    success: 'var(--color-success)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '28px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  typography: {
    fontFamily: 'var(--font-family)',
    h1: '28px',
    h2: '20px',
    body: '15px',
    small: '13px',
  },
  blur: 'blur(10px)',
};
