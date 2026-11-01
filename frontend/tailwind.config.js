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
        campus: {
          bg: '#0b1120',
          surface: '#151e32',
          hover: '#1c2742',
          subtle: '#0f172a',
          border: '#27354f',
          blue: '#3b82f6',
          blueHover: '#2563eb',
        },
        dept: {
          exam: '#f43f5e',
          academic: '#3b82f6',
          placement: '#10b981',
          admin: '#8b5cf6',
          sports: '#f59e0b',
          events: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
