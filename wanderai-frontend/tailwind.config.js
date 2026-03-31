/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lime_cream: {
          DEFAULT: '#bce784',
          100: '#273c0c',
          200: '#4f7918',
          300: '#76b524',
          400: '#9bdb47',
          500: '#bce784',
          600: '#c9eb9c',
          700: '#d7f0b5',
          800: '#e4f5ce',
          900: '#f2fae6', // Main editorial background
        },
        emerald: {
          DEFAULT: '#5dd39e',
          100: '#0d3020',
          200: '#1a6041',
          300: '#279061',
          400: '#35c081',
          500: '#5dd39e',
          600: '#7fdcb2',
          700: '#9fe5c5',
          800: '#bfedd9',
          900: '#dff6ec',
        },
        pacific_cyan: {
          DEFAULT: '#348aa7',
          500: '#348aa7',
          600: '#4daac8',
          700: '#7abfd6',
          800: '#a6d4e4',
          900: '#d3eaf1',
        },
        azure: {
          DEFAULT: '#4361ee',
          500: '#4361ee',
          600: '#4895ef',
          700: '#4cc9f0',
        },
        ochre: {
          DEFAULT: '#d4a373',
          500: '#d4a373',
          600: '#faedcd',
          700: '#fefae0',
        },
        poppy: {
          DEFAULT: '#e76f51',
          500: '#e76f51',
          600: '#f4a261',
          700: '#e9c46a',
        },
        rose: {
          DEFAULT: '#e5989b',
          500: '#e5989b',
          600: '#ffb4a2',
          700: '#ffcdb2',
        },
        vintage_grape: {
          DEFAULT: '#513b56',
          100: '#100c11',
          200: '#201722',
          300: '#302333',
          400: '#402e44',
          500: '#513b56',
          600: '#795881',
          700: '#9e7ca6',
          800: '#bea8c4',
          900: '#dfd3e1',
        },
        oyster: {
          50: '#f9f8f9', // Clean professional background
          100: '#f1eff3', // Surface nesting
          200: '#e3dfec', // Borders & low-contrast elements
          300: '#d0cadb', // Muted text/icons
          400: '#a8a2b5', // Secondary text
          500: '#7d778d', // Neutral slate-grape
        },
        moss: {
          DEFAULT: '#3a4d39',
          100: '#0f140e',
          200: '#1d271c',
          300: '#2c3a2a',
          400: '#3a4d39',
          500: '#4f6a4e',
          600: '#739571',
          700: '#a2bca1',
          800: '#d1ddd1',
          900: '#edf2ed',
        },
        parchment: {
          DEFAULT: '#fdfaf3',
          50: '#ffffff',
          100: '#fdfaf3',
          200: '#f9f1e0',
          300: '#f1e1c1',
          400: '#eacfa2',
          500: '#e2b378',
        },
        espresso: {
          DEFAULT: '#1a0f0f',
          100: '#0a0606',
          200: '#1a0f0f',
          300: '#2b1a1a',
          400: '#3b2424',
          500: '#4c2e2e',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Playfair Display', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(26, 15, 15, 0.08)',
        'card': '0 10px 40px -10px rgba(26, 15, 15, 0.12)',
        'hover': '0 20px 60px -15px rgba(26, 15, 15, 0.18)',
        'elevated': '0 30px 90px -20px rgba(26, 15, 15, 0.25)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'reveal': 'reveal 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-slide-up': 'fade-slide-up 1s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'zoom-in': 'zoom-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'reveal': {
          '0%': { opacity: '0', transform: 'translateY(-1.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-1.5rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(1.5rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
