import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/* Tokens: Resique brand palette (navy + green from the logo, gold for rewards) on the crm-apique ink/radius/shadow/motion scale.
   DESIGN-RMC.md documents every divergence from the CRM design system. */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1200px' } },
    extend: {
      colors: {
        // Resique brand (R.017, sampled from the official lockup): navy carries the bands + headings, green is the action colour,
        // gold stays reward-only. green.DEFAULT is the logo green — decorative only (2.3:1 on white); green-700 is the text/fill-safe step.
        navy: { DEFAULT: '#211A5A', 50: '#EEF0F8', 100: '#DCDFF0', 200: '#9FA6D6', 500: '#2E2A7A', 600: '#262167', 700: '#211A5A', 800: '#15113F', 900: '#0D0A29' },
        green: { DEFAULT: '#71BD41', 50: '#F1F9EA', 100: '#DFF2CF', 200: '#B7E094', 600: '#56A02A', 700: '#3E8A1E', ink: '#17330A' },
        gold: { DEFAULT: '#D4A04E', 50: '#FBF5E8', 100: '#F6E8CC', 200: '#EDD39A', 600: '#C8941B', 700: '#B08800', ink: '#3A2A0A' },
        ink: { DEFAULT: '#1E2A2A', 2: '#445050', 3: '#6F7878', 4: '#9AA0A0' },
        line: { DEFAULT: '#E2E5E8', 2: '#EEF0F2' },
        bg: '#F8F9FA',
        surface: { DEFAULT: '#FFFFFF', 2: '#F4F6F8' },
        cream: '#F5F0E8',
        ok: { DEFAULT: '#2F855A', 50: '#EAF5EE', 100: '#D9ECE1' },
        warn: { DEFAULT: '#B7791F', 50: '#FBF4E5', 100: '#F6E8C9' },
        danger: { DEFAULT: '#9B2C2C', 50: '#FBEDED', 100: '#F1D6D6' },
        info: { DEFAULT: '#2C5282', 50: '#EDF1F8', 100: '#D6E1EF' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      fontFamily: {
        // Lurd's font rule (7–8 Sep 2026): Plus Jakarta Sans everywhere, Helvetica → Futura fallbacks. Never JetBrains Mono;
        // Satoshi was dropped on 8 Sep (its tabular figures read as a mono to Lurd).
        sans: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        // codes / ids / numerals — the brand face with tabular figures via .t-code (no monospace anywhere)
        code: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        // Tailwind preflight styles <code>/<kbd> with the mono key → point it at the same humanist stack
        mono: ['"Plus Jakarta Sans"', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        // Futura is macOS-only; Jost is the free stand-in (NOT loaded until a heading uses it)
        display: ['Futura', 'Jost', '"Century Gothic"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        micro: ['10px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '700' }],
        caption: ['11px', { lineHeight: '16px' }],
        body: ['13px', { lineHeight: '20px' }],
        display: ['48px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '800' }],
      },
      borderRadius: { sm: '4px', DEFAULT: '6px', md: '6px', lg: '10px', xl: '16px', '2xl': '22px' },
      boxShadow: {
        1: '0 1px 2px rgba(20,30,30,.04), 0 1px 3px rgba(20,30,30,.06)',
        2: '0 4px 12px rgba(20,30,30,.08), 0 1px 3px rgba(20,30,30,.04)',
        3: '0 12px 32px rgba(33,26,90,.14), 0 2px 6px rgba(20,30,30,.06)',
        gold: '0 12px 32px rgba(176,136,0,.22)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.23,1,.32,1)',
        'in-out': 'cubic-bezier(.77,0,.175,1)',
        drawer: 'cubic-bezier(.32,.72,0,1)',
        spring: 'cubic-bezier(.34,1.56,.64,1)',
      },
      transitionDuration: { fast: '140ms', base: '180ms', slow: '220ms', drawer: '260ms' },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'fade-up': 'fade-up 420ms cubic-bezier(.23,1,.32,1) both',
        pop: 'pop 220ms cubic-bezier(.23,1,.32,1) both',
        shimmer: 'shimmer 2.4s linear infinite',
      },
      spacing: { 'safe-b': 'env(safe-area-inset-bottom)' },
    },
  },
  plugins: [animate],
} satisfies Config
