/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#cabf75',
          secondary: '#91873e',
          graybrand: '#a6a6a6',
          darkgold: '#91873e',
          gold: '#cabf75',
          cream: '#e1dcb2',
          bg: '#f1efda',

        },
      },
      fontFamily: {
        rounded: [
          'Comfortaa',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Ubuntu',
          'Cantarell',
          'Noto Sans',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
