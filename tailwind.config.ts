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
        primary: "#1D9486",
        secondary: "#E8F0F7",
        tertiary: "#EBB154",
        neutral: "#2D3748",
      },
      boxShadow: {
        soft: "0 12px 35px rgba(45,55,72,.08)",
      },
    },
  },
  plugins: [],
};

export default config;