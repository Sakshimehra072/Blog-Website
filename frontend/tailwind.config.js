/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#ff9432',
          hover: '#e88325',
          light: '#fff4ea',
          border: '#ffe2c7'
        },
        brand: {
          50: '#fff4ea',
          100: '#ffe2c7',
          500: '#ff9432',
          600: '#ff9432',
          700: '#e88325',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
