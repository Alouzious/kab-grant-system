/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0078B8",
        primaryDark: "#005F93",
        secondary: "#233847",
        secondaryDark: "#172631",
        accent: "#1ABC9C",
        accentDark: "#159C82",
        background: "#F4F4F4",
        surface: "#FFFFFF",
        border: "#D9E2E7",
        muted: "#7A8793",
        textMain: "#4B5563",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#FF2B2B",
        info: "#2563EB",
      },
    },
  },
  plugins: [],
};
