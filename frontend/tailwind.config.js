/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zinc: { 950: '#09090B' },
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 1.8s infinite',
        'glow':      'glow 3s ease-in-out infinite',
        'bar':       'barFill 1.2s cubic-bezier(.4,0,.2,1) forwards',
        'pop':       'pop .5s cubic-bezier(.34,1.56,.64,1) forwards',
        'fade-up':   'fadeUp .45s ease forwards',
      },
      keyframes: {
        float:    { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
        shimmer:  { '0%':{ backgroundPosition:'-600px 0' }, '100%':{ backgroundPosition:'600px 0' } },
        glow:     { '0%,100%':{ opacity:.5 }, '50%':{ opacity:1 } },
        barFill:  { from:{ width:'0%' } },
        pop:      { '0%':{ transform:'scale(.85)', opacity:0 }, '70%':{ transform:'scale(1.04)' }, '100%':{ transform:'scale(1)', opacity:1 } },
        fadeUp:   { from:{ opacity:0, transform:'translateY(14px)' }, to:{ opacity:1, transform:'translateY(0)' } },
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)',
        'glow-purple': '0 0 32px rgba(139,92,246,.3)',
        'glow-sm': '0 0 16px rgba(139,92,246,.2)',
        'card': '0 1px 0 rgba(255,255,255,.04), 0 4px 20px rgba(0,0,0,.4)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
