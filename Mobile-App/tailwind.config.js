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
        // PRIMARY VINTAGE BROWN THEME (Main brand color)
        primary: {
          DEFAULT: '#4A2E1C',
          50: '#F3E4C8',   // Sand/Beige (lightest)
          100: '#E5D1AF',  // Light beige
          200: '#D4B896',  // Warm beige
          300: '#B08A6D',  // Light brown
          400: '#8A5E44',  // Medium brown
          500: '#4A2E1C',  // Primary vintage brown
          600: '#3D2617',  // Darker brown
          700: '#301E12',  // Deep brown
          800: '#23160D',  // Very dark brown
          900: '#160E09',  // Deepest brown
        },
        // COPPER - Warm highlight color
        copper: {
          DEFAULT: '#B87333',
          50: '#F9F0E6',
          100: '#F3E1CD',
          200: '#E8D5C4',
          300: '#D4A97A',
          400: '#C38A56',
          500: '#B87333',
          600: '#9A6029',
          700: '#7D4D21',
          800: '#5F3A19',
          900: '#422710',
        },
        // GOLD - Premium/Important highlight
        gold: {
          DEFAULT: '#D4A017',
          50: '#FDF8E8',
          100: '#FBF1D1',
          200: '#F7E3A3',
          300: '#F3D575',
          400: '#E4B830',
          500: '#D4A017',
          600: '#B38613',
          700: '#936D0F',
          800: '#72540C',
          900: '#523C08',
        },
        // SAFFRON - Energetic/Action highlight
        saffron: {
          DEFAULT: '#DD7A1F',
          50: '#FEF3E8',
          100: '#FCDFC2',
          200: '#F9CB9C',
          300: '#F0A85A',
          400: '#E6923C',
          500: '#DD7A1F',
          600: '#C2691A',
          700: '#A65815',
          800: '#8A4710',
          900: '#6D380C',
        },
        // BEIGE/SAND - Background color
        sand: {
          DEFAULT: '#F3E4C8',
          50: '#FDFAF5',
          100: '#FAF5EA',
          200: '#F8F0DF',
          300: '#F3E4C8',
          400: '#E5D1AF',
          500: '#D7BE96',
          600: '#C9AB7D',
          700: '#BB9864',
          800: '#A0824E',
          900: '#856C3A',
        },
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
        // Outfit - Primary UI Font (Modern & Geometric)
        'sans': ['Outfit-Regular'],
        'sans-light': ['Outfit-Light'],
        'sans-medium': ['Outfit-Medium'],
        'sans-semibold': ['Outfit-SemiBold'],
        'sans-bold': ['Outfit-Bold'],
        'sans-extrabold': ['Outfit-ExtraBold'],
        
        // Outfit variants
        'outfit': ['Outfit-Regular'],
        'outfit-light': ['Outfit-Light'],
        'outfit-medium': ['Outfit-Medium'],
        'outfit-semibold': ['Outfit-SemiBold'],
        'outfit-bold': ['Outfit-Bold'],
        'outfit-extrabold': ['Outfit-ExtraBold'],
        
        // DM Serif Display - Stunning Headlines
        'display': ['DMSerif-Regular'],
        'serif': ['DMSerif-Regular'],
        'dmserif': ['DMSerif-Regular'],
        
        // Space Grotesk - Unique & Modern
        'grotesk': ['SpaceGrotesk-Regular'],
        'grotesk-medium': ['SpaceGrotesk-Medium'],
        'grotesk-semibold': ['SpaceGrotesk-SemiBold'],
        'grotesk-bold': ['SpaceGrotesk-Bold'],
        
        // Sanskrit Font - For Devanagari Text
        'sanskrit': ['NotoSansDevanagari-Regular'],
        'sanskrit-medium': ['NotoSansDevanagari-Medium'],
        'sanskrit-semibold': ['NotoSansDevanagari-SemiBold'],
        'sanskrit-bold': ['NotoSansDevanagari-Bold'],
        
        // Legacy support (mapping old names to new fonts)
        'poppins': ['Outfit-Regular'],
        'poppins-light': ['Outfit-Light'],
        'poppins-medium': ['Outfit-Medium'],
        'poppins-semibold': ['Outfit-SemiBold'],
        'poppins-bold': ['Outfit-Bold'],
        'playfair': ['DMSerif-Regular'],
        'playfair-bold': ['DMSerif-Regular'],
        'ancient': ['DMSerif-Regular'],
        'elegant': ['DMSerif-Regular'],
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