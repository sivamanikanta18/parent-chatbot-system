/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#B33A0B",
        secondary: "#1F3A63",
        bgsoft: "#F5F7FA",
        accent: "#FFD8C2",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(31, 58, 99, 0.12)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(120deg, #1F3A63 0%, #2e507f 52%, #B33A0B 100%)",
      },
    },
  },
  plugins: [],
};
