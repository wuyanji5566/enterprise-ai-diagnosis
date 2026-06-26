import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1224",
        muted: "#667085",
        line: "#e7eaf0",
        brand: "#145cf5",
        "brand-soft": "#eef4ff"
      },
      boxShadow: {
        soft: "0 20px 45px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;

