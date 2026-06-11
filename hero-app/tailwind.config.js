/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'neon-red': '#ff2a4d',
        'neon-red-glow': 'rgba(255, 42, 77, 0.15)',
        'neon-red-border': 'rgba(255, 42, 77, 0.3)',
        'ink': '#080a0f',
        'slate': '#1a1f2e',
        'slate-2': '#23293b',
        'ghost': '#e2e8f0',
        'mist': '#8b94a8',
        'mist-2': '#a0abc0',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        }
      }
    },
  },
  plugins: [],
}
