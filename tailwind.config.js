/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0284C7',
          cyan: '#06B6D4',
          dark: '#0B132B',
          dark2: '#1C2541',
          teal: '#14B8A6',
          amber: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
