import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f5ff",
          100: "#e6ebff",
          200: "#c3ceff",
          300: "#96a1ff",
          400: "#6a75ff",
          500: "#4046ff",
          600: "#272be6",
          700: "#1f23b3",
          800: "#181b80",
          900: "#10124d"
        }
      }
    }
  },
  plugins: []
};

export default config;
