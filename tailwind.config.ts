import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Performance-instrument palette — white surface, deep navy/black ink,
        // electric blue accent, monospace eyebrows. Replaces the earlier cream
        // theme entirely.
        surface: {
          DEFAULT: "#FFFFFF",
          panel: "#F4F4F6",
          subtle: "#FAFAFB",
        },
        ink: {
          DEFAULT: "#0A0E1A",
          900: "#08090C",
          700: "#1A1D26",
          500: "#3A3D48",
          400: "#6B6F78",
          300: "#9CA0A8",
          200: "#C7CAD0",
        },
        line: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
          subtle: "#EEF0F3",
        },
        // Brand accent — Secure Steps pink. Token name kept as "electric" to
        // avoid churning every consumer; the value is what changed.
        electric: {
          DEFAULT: "#FA7BD6",
          400: "#FCA0E0",
          500: "#FA7BD6",
          600: "#E254BC",
          700: "#B73D96",
          tint: "#FEE9F8",
        },
        positive: "#16A34A",
        warning: "#E76F51",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        labelmono: "0.12em",
        wide2: "0.18em",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "card-enter": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "card-enter": "card-enter 0.5s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
