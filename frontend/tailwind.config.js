/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          50:  "#fbffe0",
          100: "#f5ffc2",
          200: "#eeff85",
          300: "#e2ff47",
          400: "#C8FF00",
          500: "#a8d600",
          600: "#82a800",
          700: "#5f7a00",
          800: "#4a6100",
          900: "#3a4d00",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0a0a0a",
          card: "#ffffff",
          "card-dark": "#111111",
          "elevated": "#fafafa",
          "elevated-dark": "#1a1a1a",
        },
        brand: {
          50: "#fbffe0",
          100: "#f5ffc2",
          400: "#C8FF00",
          500: "#a8d600",
          600: "#82a800",
        },
        buffer: {
          50:  "#fbffe0",
          100: "#f5ffc2",
          200: "#eeff85",
          300: "#e2ff47",
          400: "#C8FF00",
          500: "#a8d600",
          600: "#82a800",
          700: "#5f7a00",
          800: "#4a6100",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",
        sidebar: "1px 0 0 rgba(0, 0, 0, 0.06)",
      },
      width: {
        sidebar: "16.5rem",
      },
    },
  },
  plugins: [],
};

