/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F2', // Primary Warm Ivory
          200: '#F3EDE2',
          300: '#E5DCCE',
          400: '#CFBFAC',
          500: '#B5A08A',
        },
        charcoal: {
          50: '#F6F6F7',
          100: '#E5E7EB',
          200: '#D1D5DB',
          400: '#6B7280',
          600: '#374151',
          700: '#2A303A',
          800: '#1F242C',
          900: '#16191F', // Primary Charcoal Text
          950: '#0E1014',
        },
        coral: {
          50: '#FFF7F5',
          100: '#FFECE7',
          200: '#FFD6CC',
          300: '#FFB5A3',
          400: '#FA7B60',
          500: '#E25B3D', // Primary Restrained Coral
          600: '#C74528',
          700: '#A4331C',
          800: '#832A18',
          900: '#6D2618',
        },
        sand: {
          50: '#FCFBF9',
          100: '#F7F5EE',
          200: '#ECE8DB',
          300: '#DDD7C4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(22, 25, 31, 0.04), 0 1px 3px 0 rgba(22, 25, 31, 0.03)',
        'card': '0 2px 8px -2px rgba(22, 25, 31, 0.06), 0 1px 4px -1px rgba(22, 25, 31, 0.04)',
        'elevated': '0 12px 30px -10px rgba(22, 25, 31, 0.08), 0 4px 12px -2px rgba(22, 25, 31, 0.03)',
      }
    },
  },
  plugins: [],
}
