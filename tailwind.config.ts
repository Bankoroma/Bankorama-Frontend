import type { Config } from "tailwindcss";

// Design system "Apple bento" : fond #f5f5f7, cartes blanches, encre #1d1d1f,
// teal de marque assombri pour respecter un contraste AA (4.5:1) sur blanc.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d1d1f",
        mist: "#f5f5f7",
        pill: "#f0f0f2",
        muted: "#6e6e73",
        subtle: "#86868b",
        line: "#e5e5ea",
        primary: {
          DEFAULT: "#0F766E",
          hover: "#0b5f58",
          brand: "#1D9486",
          soft: "#e6f4f2",
        },
        mint: "#34d399",
        sky: "#0071e3",
        amber: "#b45309",
        danger: "#c4320a",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        bento: "22px",
      },
      boxShadow: {
        bento: "0 1px 8px rgba(0,0,0,0.05)",
        lift: "0 12px 32px rgba(0,0,0,0.08)",
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        rise: "rise 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
