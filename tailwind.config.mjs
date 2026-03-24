/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
      './src/*.{js,ts,jsx,tsx}',
      './src/constant/*.{js,ts,jsx,tsx}',
      './src/Root.tsx',
      './src/App.tsx',
    ],
    prefix: "",
    
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
  
        },
        animation: {
  
        },
      },
    },
    plugins: [
    ],
  }