/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0A1128',
          850: '#0E1736',
          800: '#131F46',
          700: '#1D2E62',
          600: '#2A4186',
        },
        electric: {
          400: '#2EF7A0',
          500: '#00F59B',
          600: '#00D685',
        },
        brand: {
          blue: '#1E40AF',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(0, 245, 155, 0.15)',
        'glow': '0 0 25px -5px rgba(0, 245, 155, 0.25)',
      }
    },
  },
  plugins: [],
}
