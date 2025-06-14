/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          cyan: '#00f3ff',
          blue: '#0066ff',
          purple: '#3366ff',
        },
        dark: {
          bg: '#0f0f23',
          bgMedium: '#1a1a2e',
          bgLight: '#16213e',
        },
        light: {
          bg: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
