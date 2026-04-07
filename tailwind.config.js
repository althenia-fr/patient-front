/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#be49bc',
          secondary: '#6c5ce7',
          yellow: '#ffd54f',
          orange: '#ffab40',
          gray: '#636e72',
          bg: '#f8f4ff',
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
