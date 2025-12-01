/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ancient Sanskrit Theme Colors
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
          500: '#f97316',
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
        'sanskrit': ['Noto Sans Devanagari', 'serif'],
        'ancient': ['Cinzel', 'serif'],
        'elegant': ['Cormorant Garamond', 'serif'],
        'samarkan': ['Samarkan', 'Cinzel Decorative', 'Cinzel', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'wave': 'wave 2.5s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 8s linear infinite',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'text-reveal': 'textReveal 0.8s ease-out',
        'sacred-glow': 'sacredGlow 3s ease-in-out infinite alternate',
        'divine-pulse': 'divinePulse 2s ease-in-out infinite',
        'om-rotate': 'omRotate 10s linear infinite',
        'lotus-bloom': 'lotusBloom 4s ease-in-out infinite',
        'mantra-flow': 'mantraFlow 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-50px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(50px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(248, 113, 113, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(248, 113, 113, 0.8)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(249, 115, 22, 0.8)',
            transform: 'scale(1.02)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        gradientShift: {
          '0%, 100%': { 
            background: 'linear-gradient(45deg, #f97316, #ea580c)' 
          },
          '33%': { 
            background: 'linear-gradient(45deg, #ea580c, #c2410c)' 
          },
          '66%': { 
            background: 'linear-gradient(45deg, #c2410c, #f97316)' 
          },
        },
        textReveal: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px) rotateX(-90deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) rotateX(0deg)'
          },
        },
        sacredGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(251, 146, 60, 0.3), inset 0 0 20px rgba(251, 146, 60, 0.1)',
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(251, 146, 60, 0.6), inset 0 0 30px rgba(251, 146, 60, 0.2)',
          },
        },
        divinePulse: {
          '0%, 100%': { 
            opacity: '0.8',
            transform: 'scale(1) rotate(0deg)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.1) rotate(180deg)',
          },
        },
        omRotate: {
          '0%': { 
            transform: 'rotate(0deg) scale(1)',
            opacity: '0.7'
          },
          '50%': { 
            transform: 'rotate(180deg) scale(1.1)',
            opacity: '1'
          },
          '100%': { 
            transform: 'rotate(360deg) scale(1)',
            opacity: '0.7'
          },
        },
        lotusBloom: {
          '0%': { 
            transform: 'scale(0.8) rotate(-10deg)',
            opacity: '0.6'
          },
          '50%': { 
            transform: 'scale(1.2) rotate(10deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(0.8) rotate(-10deg)',
            opacity: '0.6'
          },
        },
        mantraFlow: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
          },
        },
      },
      backgroundImage: {
        'ancient-pattern': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI0OSwgMTE1LCA1MiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')",
        'paper-texture': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')",
      }
    },
  },
  plugins: [],
}