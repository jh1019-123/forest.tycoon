/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f4f8f4",
          100: "#e5ece5",
          200: "#ccd9cb",
          300: "#a3baa1",
          400: "#759873",
          500: "#557c53",
          600: "#416240",
          700: "#344e33",
          800: "#2a3f29",
          900: "#1e2c1d",
          950: "#101810",
        },
        amber: {
          50: "#fdfbeb",
          100: "#fbf6c7",
          500: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
}
