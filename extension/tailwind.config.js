/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pinterest: {
          red: '#E60023',
          hover: '#AD081B',
        },
        amazon: {
          orange: '#FF9900',
          dark: '#131921',
          light: '#232F3E',
        }
      }
    },
  },
  plugins: [],
}
