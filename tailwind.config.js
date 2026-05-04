/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0.55)" },
          "100%": { boxShadow: "0 0 0 14px rgba(52, 211, 153, 0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
