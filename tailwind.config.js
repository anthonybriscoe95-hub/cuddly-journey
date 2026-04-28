/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0B12',
          card: '#15151E',
          soft: '#1C1C28',
        },
        brand: {
          DEFAULT: '#8B5CF6',
          deep: '#6D28D9',
          glow: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(139, 92, 246, 0.6)',
      },
    },
  },
  plugins: [],
};
