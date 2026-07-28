const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        lg: '1200px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#EEF4FF',
          100: '#DCE8FF',
          200: '#BDD2FF',
          300: '#8CB4FF',
          400: '#5790FF',
          500: '#2F72FF',
          600: '#1F5DE8',
          700: '#1949BB',
          800: '#1B4097',
          900: '#1C3978',
          DEFAULT: '#246BFD',
        },
        green: {
          ...colors.green,
          DEFAULT: '#20B66B',
        },
        neutral: {
          ...colors.neutral,
          DEFAULT: '#F5F7F3',
        },
        canvas: '#F5F7F3',
        paper: '#FFFFFF',
        ink: '#17211D',
        muted: '#65736C',
        lime: '#C7F36B',
        text: '#17211D',
      },
      fontFamily: {
        sans: ['Inter', 'Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 33, 29, 0.04), 0 12px 35px rgba(23, 33, 29, 0.07)',
        float: '0 20px 60px rgba(23, 33, 29, 0.13)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    }
  },
  plugins: []
};
