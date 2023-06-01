/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // 'back': {
        //   default: "#1C1C1C",
        //   100: '#1C1C1C',
        // },
        b1: '#1C1C1C',
        b2: '#2c2c2c',
        b3: '#404040',
      },
    }
  },
  plugins: []
};