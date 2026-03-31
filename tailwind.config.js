/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1A3A1F',
          light: '#2D5435',
          dark: '#0F2212',
        },
        lime: {
          DEFAULT: '#7AB648',
          light: '#9DD16A',
          dark: '#5E9233',
        },
        cream: {
          DEFAULT: '#F7F3EB',
          dark: '#EDE8DC',
        },
        ink: '#1C1C1A',
        gold: '#C89A2A',
        bark: '#6B4226',
        // keep brand alias for existing components
        brand: {
          50: '#f0fdf4',
          100: '#e8f5e0',
          200: '#c8e9aa',
          300: '#9DD16A',
          400: '#7AB648',
          500: '#7AB648',
          600: '#5E9233',
          700: '#1A3A1F',
          800: '#0F2212',
          900: '#081409',
        },
      },
      fontFamily: {
        sans: ['"Cera Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cera Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
