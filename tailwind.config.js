const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: colors.indigo,
        twblue: colors.blue,
      },
    },
  },
  plugins: [],
};
