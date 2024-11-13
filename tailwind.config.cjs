/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        offwhite: "#ededed",
        solidjs: "#446b9e",
      },
      animation: {
        "smooth-spin": "spinSmooth 1s linear infinite",
        fadeIn: "fadeIn 0.2s ease-in-out",
        fadeOut: "fadeOut 0.2s ease-in-out",
      },
      keyframes: {
        spinSmooth: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
