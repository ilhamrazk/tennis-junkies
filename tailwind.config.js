/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B00',
          'orange-hover': '#E05E00',
          'orange-light': '#FFF5EB',
          dark: '#0F172A',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(255, 107, 0, 0.25)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 8px 30px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
