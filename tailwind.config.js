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
        primary: '#2563EB',
        green: '#22C55E',
        neutral: '#F5F7FA',
        text: '#1F2937'
      }
    }
  },
  plugins: []
};
