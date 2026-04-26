/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'lunara-core':    '#7C3AED',
        'lunara-glow':    '#9D5FF5',
        'lunara-bloom':   '#C084FC',
        'lunara-mist':    '#EDE9FE',
        'lunara-whisper': '#FAF5FF',
        'lunara-midnight':'#12091E',
        'surface-bg':     '#FAF5FF',
        'surface-card':   '#FFFFFF',
        'surface-sunken': '#F3E8FF',
        'surface-hover':  '#EDE9FE',
        'border-default': 'rgba(124,58,237,0.12)',
        'border-emphasis':'rgba(124,58,237,0.24)',
        'phase-menstrual': '#F43F5E',
        'phase-follicular':'#8B5CF6',
        'phase-ovulation': '#06B6D4',
        'phase-luteal':    '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'premium-sm':  '8px',
        'premium-md':  '12px',
        'premium-lg':  '16px',
        'premium-xl':  '20px',
        'premium-2xl': '28px',
      },
      boxShadow: {
        'sm':    '0 1px 2px rgba(10,6,18,0.06)',
        'md':    '0 4px 16px rgba(10,6,18,0.10)',
        'float': '0 8px 32px rgba(124,58,237,0.40)',
      },
      keyframes: {
        confirmSpring: {
          '0%':   { transform: 'scale(0)',    opacity: '0' },
          '60%':  { transform: 'scale(1.15)', opacity: '1' },
          '80%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.75' },
        },
      },
      animation: {
        'confirm':       'confirmSpring 400ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'gentle-pulse':  'gentlePulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
