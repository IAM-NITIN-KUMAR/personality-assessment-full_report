/**
 * The app's colours, in one place.
 *
 * Everything that paints a colour reads from here: Tailwind (tailwind.config.ts
 * turns these into the `electric`, `surface`, `ink` and `line` classes), the
 * inline styles and SVG charts on screen, and the PDF reports. To re-theme the
 * product, change the values in THEME and nothing else.
 *
 * The palette follows Origen (joinorigen.in): royal blue does the work
 * (buttons, tags, icons, charts) and Origen's sky blue is the light touch
 * (glow, focus rings, hover).
 *
 * Not themed on purpose: the animal illustrations (lib/v2/animal-geometry.ts)
 * and the green / amber / red status colours.
 */
export const THEME = {
  /** Royal blue: the accent for actions, tags, icons and chart lines. Carries white text. */
  accent: "#1D5FD6",
  /** Hover and pressed state of the accent, and the far end of accent gradients. */
  accentDark: "#1647A8",
  /** Accent-coloured text that sits on a tint. */
  accentInk: "#1D4FB0",
  /** Light accent for hairlines, timeline dots and chart rings. */
  accentSoft: "#BCD0F7",
  /** Origen sky blue: glow, focus rings and hover borders. Too light for white text. */
  sky: "#5AB4EE",
  skySoft: "#BFE0F7",

  /** Pale blue behind tags, icon chips and highlighted boxes. */
  tint: "#E8F0FE",
  /** Default page surface. */
  surface: "#F5F9FE",
  /** Barely-blue fill for cards that sit inside a white panel. */
  surfaceSubtle: "#F7FAFF",
  /** The three stops of the page wash, top-left to bottom-right. */
  wash: ["#E9F4FD", "#EEF4FC", "#EAF0FB"],

  ink: "#0A0E1A",
  ink900: "#08090C",
  ink700: "#1A1D26",
  ink500: "#3A3D48",
  ink400: "#6B6F78",
  ink300: "#9CA0A8",
  ink200: "#C7CAD0",

  line: "#DFE8F3",
  lineStrong: "#C9D6E6",
  lineSubtle: "#EAF0F7",

  positive: "#16A34A",
  warning: "#E76F51",
} as const;

/** A THEME colour at the given opacity, as a CSS `rgba()` string. */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}

/** The same colour as an `r, g, b` triple, for places that build their own `rgb()`. */
export function rgbTriple(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** The pale blue wash behind every screen. */
export const PAGE_WASH = `linear-gradient(135deg, ${THEME.wash[0]} 0%, ${THEME.wash[1]} 45%, ${THEME.wash[2]} 100%)`;

/** The soft glows laid over the wash. */
export const GLOW = {
  sky: alpha(THEME.sky, 0.22),
  royal: alpha(THEME.accent, 0.1),
  pale: alpha(THEME.skySoft, 0.3),
  mist: alpha(THEME.sky, 0.12),
} as const;

/** The main call-to-action fill ("Begin assessment"). */
export const CTA_GRADIENT = `linear-gradient(135deg, ${THEME.accent} 0%, ${THEME.accentDark} 100%)`;

/** Colours for charts that compare a few series: accent first, then sky, then a light blue, then green. */
export const CHART_SERIES = [THEME.accent, THEME.sky, THEME.accentSoft, "#10b981"] as const;
