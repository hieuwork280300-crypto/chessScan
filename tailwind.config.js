/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: '#5C7A6B',
        amber: '#D4A24A',
        bg: { DEFAULT: '#FAF7F2', d: '#16181B' },
        ink: { DEFAULT: '#1A1A1A', d: '#ECECEC' },
        sub: { DEFAULT: '#6B6B6B', d: '#9C9C9C' },
        card: { DEFAULT: '#FFFFFF', d: '#1E2024' },
        line: { DEFAULT: '#ECE6DC', d: '#2A2D31' },
        board: { light: '#E8DDC8', dark: '#A88B6C' },
        paper: { DEFAULT: '#FCFAF4', ink: '#33312b', line: '#EadFC9', label: '#9a8e74' },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        hand: ['Caveat_500Medium'],
      },
    },
  },
  plugins: [],
};
