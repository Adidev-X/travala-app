/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#ba0014',
        'primary-container': '#e31e25',
        'on-primary': '#ffffff',
        secondary: '#425d97',
        background: '#fff8f7',
        'on-background': '#291715',
        surface: '#fff8f7',
        'on-surface': '#291715',
        'on-surface-variant': '#5d3f3c',
        'outline-variant': '#e7bdb8',
      },
    },
  },
  plugins: [],
};
