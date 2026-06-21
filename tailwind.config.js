/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Driven by CSS custom properties in index.css so light/dark swap cleanly.
        bg: 'rgb(var(--void) / <alpha-value>)',
        void: 'rgb(var(--void) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        panel2: 'rgb(var(--panel-2) / <alpha-value>)',
        hair: 'rgb(var(--hair) / <alpha-value>)',
        hair2: 'rgb(var(--hair-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        accent: 'rgb(var(--amber) / <alpha-value>)',
        hud: 'rgb(var(--hud) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
        alert: 'rgb(var(--alert) / <alpha-value>)',
        // verification semantics
        verified: 'rgb(var(--ok) / <alpha-value>)',
        inferred: 'rgb(var(--hud) / <alpha-value>)',
        corrected: 'rgb(var(--info) / <alpha-value>)',
        unverified: 'rgb(var(--alert) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Archivo"', '"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
      boxShadow: {
        lift: '0 30px 80px -40px rgb(0 0 0 / 0.9)',
        hud: '0 0 0 1px rgb(var(--amber) / 0.3), 0 0 30px -6px rgb(var(--amber) / 0.4)',
      },
      keyframes: {
        recblink: {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0.25' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        recblink: 'recblink 1.4s steps(1) infinite',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
