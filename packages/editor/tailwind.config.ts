import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-deep)',
        foreground: 'var(--text-primary)',

        green: {
          950: 'var(--green-950)',
          900: 'var(--green-900)',
          800: 'var(--green-800)',
          700: 'var(--green-700)',
          600: 'var(--green-600)',
          500: 'var(--green-500)',
          400: 'var(--green-400)',
          300: 'var(--green-300)',
          200: 'var(--green-200)',
        },

        // Semantic aliases
        primary: {
          DEFAULT: 'var(--green-600)',
          foreground: '#FFFFFF',
          hover: 'var(--green-500)',
          active: 'var(--green-700)',
        },
        secondary: {
          DEFAULT: 'var(--green-900)',
          foreground: 'var(--green-200)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'var(--bg-elevated)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--bg-elevated)',
          foreground: 'var(--text-primary)',
        },

        border: 'var(--border-default)',
        input: 'var(--border-subtle)',
        ring: 'var(--green-600)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
