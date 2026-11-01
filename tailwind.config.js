/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07100B',
          900: '#0C1710',
          800: '#122019',
          700: '#1A2D23',
          600: '#26402F',
        },
        ball: {
          DEFAULT: '#D8F53B',
          dim: '#B6D12C',
          soft: 'rgba(216,245,59,0.12)',
        },
        clay: {
          DEFAULT: '#FF7A45',
          dim: '#E2602B',
          soft: 'rgba(255,122,69,0.14)',
        },
        chalk: '#F1F5EC',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ball: '0 8px 30px -6px rgba(216,245,59,0.45)',
        clay: '0 8px 30px -6px rgba(255,122,69,0.45)',
        dock: '0 20px 50px -10px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheet-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.2,0.8,0.2,1) both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.2,0.8,0.2,1) both',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
