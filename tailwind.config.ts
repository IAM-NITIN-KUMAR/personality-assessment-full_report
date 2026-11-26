import type { Config } from "tailwindcss";
import { THEME, alpha } from "./lib/theme";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Every value comes from lib/theme.ts, which is the one place colours
        // are defined (screens, charts and PDFs all read it). Change it there.
        surface: {
          DEFAULT: THEME.surface,
          panel: THEME.tint,
          subtle: THEME.surfaceSubtle,
          wash: THEME.wash[0],
        },
        ink: {
          DEFAULT: THEME.ink,
          900: THEME.ink900,
          700: THEME.ink700,
          500: THEME.ink500,
          400: THEME.ink400,
          300: THEME.ink300,
          200: THEME.ink200,
        },
        line: {
          DEFAULT: THEME.line,
          strong: THEME.lineStrong,
          subtle: THEME.lineSubtle,
        },
        // Brand accent. Royal blue by default; 400 is Origen's sky blue for
        // glow, focus and hover. The token keeps its original name, "electric".
        electric: {
          DEFAULT: THEME.accent,
          300: THEME.accentSoft,
          400: THEME.sky,
          500: THEME.accent,
          600: THEME.accentDark,
          700: THEME.accentInk,
          tint: THEME.tint,
        },
        positive: THEME.positive,
        warning: THEME.warning,
      },
      boxShadow: {
        // Hover lift on answer options, and the focus ring on text inputs.
        lift: `0 12px 24px -8px ${alpha(THEME.accent, 0.22)}`,
        focus: `0 0 0 3px ${alpha(THEME.sky, 0.25)}`,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Urbanist", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Urbanist", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Urbanist", "system-ui", "sans-serif"],
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
