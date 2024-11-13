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
      },
      keyframes: {
        spinSmooth: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
