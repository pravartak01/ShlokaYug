/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app-example/app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ancient Sanskrit Theme Colors (same as web app)
        ancient: {
          50: '#fdf6e3',   // Light parchment
          100: '#faecc2',  // Pale saffron
          200: '#f5d780',  // Light gold
          300: '#eab834',  // Sanskrit gold
          400: '#d4940c',  // Deep gold
          500: '#b8860b',  // Dark golden rod
          600: '#996f0a',  // Bronze
          700: '#7a5708',  // Dark bronze
          800: '#5c4106',  // Burnt bronze
          900: '#3d2b04',  // Deep brown
        },
        saffron: {
          50: '#fff8ed',
          100: '#feecc7',
          200: '#fdd68a',
          300: '#fcb94d',
          400: '#fb923c',
          500: '#f97316',  // Primary saffron
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sandalwood: {
          50: '#faf5f0',
          100: '#f4e6d7',
          200: '#e8ccae',
          300: '#dab281',
          400: '#ca9554',
          500: '#c08552',
          600: '#a0704a',
          700: '#835941',
          800: '#6c4839',
          900: '#583b31',
        },
        lotus: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        'sanskrit': ['NotoSansDevanagari', 'serif'],
        'ancient': ['Cinzel', 'serif'],
        'elegant': ['CormorantGaramond', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sacred-glow': 'sacredGlow 3s ease-in-out infinite alternate',
        'divine-pulse': 'divinePulse 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}