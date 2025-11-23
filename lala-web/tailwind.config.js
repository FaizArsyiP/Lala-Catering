/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      tablet: "600px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      desk: "1440px",
    },
  },
  plugins: [],
};
