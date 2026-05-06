/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070709",
          900: "#0b0c0f",
          850: "#101116",
          800: "#15171c",
          750: "#1b1d24",
          700: "#23262e",
          600: "#2f323b",
          500: "#3b3f49",
        },
        flame: {
          50: "#fff4ec",
          100: "#ffe1cc",
          200: "#ffc299",
          300: "#ff9a5c",
          400: "#ff7a2e",
          500: "#ff6a13",
          600: "#e85a05",
          700: "#bd4604",
          800: "#8a3403",
          900: "#5a2202",
        },
      },
      fontFamily: {
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,106,19,0.35), 0 8px 30px -10px rgba(255,106,19,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -15px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,106,19,0.55)" },
          "70%": { boxShadow: "0 0 0 12px rgba(255,106,19,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,106,19,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out both",
        "scale-in": "scale-in 180ms ease-out both",
        shimmer: "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
