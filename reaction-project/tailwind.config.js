/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'iosevka': ['Iosevka'],
        'iosevkaEx': ['Iosevka-Extended'],
      },
    },
  },
  plugins: [],
}

