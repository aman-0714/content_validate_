/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette ──────────────────────────────────────────────────────
        navy: {
          950: '#060810',
          900: '#0B0F1A',
          800: '#111827',
          700: '#1A2235',
          600: '#1E2A3B',
          500: '#243044',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          50:  '#E0FAFE',
          100: '#B3F4FD',
          200: '#66E9FA',
          300: '#1ADAF7',
          400: '#00C8F0',
          500: '#00D4FF',
          600: '#00AACF',
          700: '#0087A3',
          800: '#006378',
          900: '#003F4D',
        },
        // ── Score colours ──────────────────────────────────────────────────────
        score: {
          excellent: '#10B981',
          good:      '#3B82F6',
          average:   '#F59E0B',
          poor:      '#EF4444',
        },
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-navy': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M0 0h40v1H0zm0 39h40v1H0zM0 0v40H1V0zm39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'card':    '0 0 0 1px rgba(255,255,255,0.06), 0 2px 16px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(0,212,255,0.25), 0 4px 24px rgba(0,212,255,0.08)',
        'cyan-glow': '0 0 24px rgba(0,212,255,0.25)',
        'cyan-sm':   '0 0 12px rgba(0,212,255,0.18)',
      },
      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'fade-in-up':   'fadeInUp 0.5s ease forwards',
        'stat-pop':     'statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':      'shimmer 1.5s infinite',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
        'bar-fill':     'barFill 1s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        fadeIn:     { from:{ opacity:0, transform:'translateY(8px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        fadeInUp:   { from:{ opacity:0, transform:'translateY(18px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        statPop:    { '0%':{ transform:'scale(0.85)', opacity:0 }, '70%':{ transform:'scale(1.06)' }, '100%':{ transform:'scale(1)', opacity:1 } },
        shimmer:    { '0%':{ backgroundPosition:'-400px 0' }, '100%':{ backgroundPosition:'400px 0' } },
        glowPulse:  { '0%,100%':{ boxShadow:'0 0 20px rgba(0,212,255,0.2)' }, '50%':{ boxShadow:'0 0 40px rgba(0,212,255,0.5)' } },
        barFill:    { from:{ width:'0%' } },
      },
    },
  },
  plugins: [],
}
