/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#05070C',
        app: '#0F172A',
        sunken: '#0B1120',
        surface: '#1E293B',
        border: {
          DEFAULT: '#334155',
          subtle: '#475569',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
        },
        accent: {
          DEFAULT: '#FF6B00',
          light: '#FF8A33',
        },
        accent2: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          lighter: '#67E8F9',
        },
        good: {
          DEFAULT: '#10B981',
          text: '#6EE7B7',
        },
        soon: {
          DEFAULT: '#F59E0B',
          text: '#FBBF24',
          text2: '#FCD34D',
        },
        urgent: {
          DEFAULT: '#F43F5E',
        },
        ice: {
          surface: '#4C0519',
          card: '#FFF1F2',
          ink: '#9F1239',
          ink2: '#881337',
          muted: '#FDA4AF',
          muted2: '#FECDD3',
        },
        cat: {
          handling: '#22D3EE',
          style: '#C4B5FD',
          performance: '#FF8A33',
          protection: '#6EE7B7',
          utility: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        sans: ['"IBM Plex Sans Thai"', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        7: '7px',
        9: '9px',
        11: '11px',
        13: '13px',
        14: '14px',
        15: '15px',
        16: '16px',
        18: '18px',
        20: '20px',
        22: '22px',
        26: '26px',
      },
      boxShadow: {
        'btn-orange': '0 12px 26px -12px rgba(255,107,0,.9)',
        'btn-cyan': '0 12px 26px -12px rgba(6,182,212,.9)',
        toast: '0 18px 34px -14px rgba(0,0,0,.9)',
        dropdown: '0 26px 50px -12px rgba(0,0,0,.8)',
        ice: '0 0 0 1px rgba(244,63,94,.2), 0 14px 30px -14px rgba(244,63,94,.5)',
      },
      spacing: {
        3.5: '14px',
      },
      keyframes: {
        mcIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        mcUp: {
          '0%': { transform: 'translateY(22px)' },
          '100%': { transform: 'translateY(0)' },
        },
        mcFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        mcPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.14)', opacity: '.5' },
        },
        mcHalo: {
          '0%': { transform: 'scale(.7)', opacity: '.55' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        mcScan: {
          '0%': { top: '8%' },
          '100%': { top: '86%' },
        },
        mcBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.25' },
        },
      },
      animation: {
        mcIn: 'mcIn .24s ease-out',
        mcUp: 'mcUp .32s cubic-bezier(.22,1,.36,1)',
        mcFade: 'mcFade .18s ease-out',
        mcPulse: 'mcPulse 1.1s ease-in-out infinite',
        mcHalo: 'mcHalo 1.6s ease-in-out infinite',
        mcScan: 'mcScan .9s ease-in-out infinite alternate',
        mcBlink: 'mcBlink 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
