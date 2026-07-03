/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        harbor: {
          50: "#eff8ff",
          100: "#daefff",
          200: "#bde4ff",
          300: "#90d4ff",
          400: "#5bbcfd",
          500: "#359cfa",
          600: "#1f7def",
          700: "#1765dc",
          800: "#1952b2",
          900: "#1b478c",
          950: "#152c55",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(21,44,85,0.08), 0 4px 16px rgba(21,44,85,0.06)",
      },
    },
  },
  plugins: [],
};
