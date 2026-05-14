/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saemaul: {
          green: "#009247",
          dark: "#007a3b",
          light: "#e6f4ed",
          vibrant: "#00c853",
          accent: "#2ecc71",
        },
        premium: {
          slate: "#0f172a",
          blue: "#3b82f6",
          indigo: "#6366f1",
          emerald: "#10b981",
        }
      },
      fontFamily: {
        sans: ['Presentation', 'Outfit', 'Inter', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'scroll': 'scroll 40s linear infinite',
        'mesh-move': 'meshMove 15s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        meshMove: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(5%, 5%) scale(1.1)' },
          '100%': { transform: 'translate(-5%, 2%) scale(1)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
