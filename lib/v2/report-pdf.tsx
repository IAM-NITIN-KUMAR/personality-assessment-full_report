import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { Canvas, Document, Font, Line, Page, Polygon, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { ANIMALS, DIM_LABELS, DOMAIN_LABELS, ROLE_LABELS } from "./types";
import type { CareerCard, RadarDim, ReportV2 } from "./types";
import type { Journey } from "./journeys/data";
import { journeyIntroLead } from "./journeys/select";
import { ANIMAL_ART, PUP, PUP_ART } from "./animal-geometry";
import { ThinkingPdfPage } from "./fp/thinking-pdf";
import { THEME } from "../theme";

// ---------------------------------------------------------------------------
// react-pdf counterpart of components/v2/report-view.tsx. Mirrors its section
// order, copy, and conditional logic exactly, as one continuous run of sheets
// rather than three fixed pages, so no sheet is left part empty. react-pdf
// has no Tailwind, no client-only deps (framer-motion, lucide-react) and no
// custom font files here — base-14 fonts only (Helvetica for body/headings,
// Courier for mono eyebrows), per the PDF translation rules. Because of that
// constraint, several small helpers below are *intentional* duplicates of
// logic that lives in report-view.tsx (date/initials formatting, the
// heading→percent slider math, the six-axis hex order, the more_signal
// fallback copy) rather than imports — importing the component file would
// drag "use client" / framer-motion / lucide-react into the PDF bundle.
// ---------------------------------------------------------------------------

// Never split a word across lines ("PATH-WAY"): wrap whole words only.
Font.registerHyphenationCallback((word) => [word]);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateISO(iso: string): string {
  const [y, m, d] = iso.split("-");
  const mi = Number(m) - 1;
  if (!y || !d || mi < 0 || mi > 11 || Number.isNaN(mi)) return iso;
  return `${d} ${MONTHS[mi]} ${y}`;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Six axes, same clock positions the on-screen hexagon uses: top, upper-right,
// lower-right, bottom, lower-left, upper-left.
const HEX_ORDER: RadarDim[] = ["analytical", "creative", "leadership", "people", "practical", "entrepreneurial"];

const CONF_BAND_STYLE: Record<string, { bg: string; fg: string }> = {
  confirmed: { bg: "#e8f8ef", fg: "#15803d" },
  provisional: { bg: "#fff7ed", fg: "#b45309" },
  mismatch: { bg: "#fef2f2", fg: "#dc2626" },
};

// Bi-directional scale sides. Left/right order is fixed so every report
// renders the same axis the same way.
const ENERGY_SIDES = { left: "Reflective", right: "Outgoing" };
const DECISION_SIDES = { left: "Deliberate", right: "Instinctive" };
const STRUCTURE_SIDES = { left: "Structured", right: "Open-ended" };

/** "Clearly X" -> 90% toward X; "Lean X" -> 70%; "Balanced" -> 50%. */
function scalePercent(heading: string, rightLabel: string): number {
  if (heading === "Balanced") return 50;
  const magnitude = heading.startsWith("Clearly ") ? 90 : heading.startsWith("Lean ") ? 70 : 50;
  const side = heading.replace(/^(Clearly|Lean)\s+/, "");
  return side === rightLabel ? magnitude : 100 - magnitude;
}

const MORE_SIGNAL_FALLBACK_COPY =
  "We don't have enough signal yet to name your type honestly, and a made-up label would waste your time. The next steps below will help build that picture faster than another question could.";

const MATCH_KEYWORDS: Array<{ test: RegExp; label: string }> = [
  { test: /business|management|commerce|sales|operator|advisory|hr/i, label: "BIZ" },
  { test: /engineer|developer|data|tech|code|product-tech|infrastructure|build/i, label: "TECH" },
  { test: /finance|market|risk|deal|econom|quant|analyst/i, label: "FIN" },
  { test: /design|creative|brand|content|media/i, label: "DSGN" },
];
function matchTag(title: string): string {
  const found = MATCH_KEYWORDS.find((m) => m.test.test(title));
  return found ? found.label : "PATH";
}

// ---------------------------------------------------------------------------
// Palette (translated from the on-screen ink/accent/line scale — see
// tailwind.config.ts `ink`/`line` tokens and the report-view.tsx accent).
// ---------------------------------------------------------------------------

const INK = "#0A0E1A";
const INK_700 = "#1A1D26";
const INK_500 = "#3A3D48";
const INK_400 = "#6B6F78";
const INK_300 = "#9CA0A8";
const LINE = THEME.line;
const LINE_SUBTLE = THEME.lineSubtle;
const ACCENT = THEME.accent;
const CHIP_BG = THEME.tint;
const CARD_BG = THEME.surfaceSubtle;
const CARD_BG_2 = THEME.surfaceSubtle;
const GREEN_BG = "#e8f8ef";
const GREEN_FG = "#15803d";
const BLUE_BG = "#eef3fe";
const BLUE_FG = "#2563eb";
const AMBER_FG = "#b45309";

const SANS = "Helvetica";
const SANS_BOLD = "Helvetica-Bold";
const SANS_ITALIC = "Helvetica-Oblique";
const MONO = "Courier";
const MONO_BOLD = "Courier-Bold";

const RAW = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 34, paddingHorizontal: 34, fontSize: 9.5, color: INK_500, fontFamily: SANS },
  pageTag: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: CHIP_BG,
    color: ACCENT,
    fontFamily: MONO_BOLD,
    fontSize: 7.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  logoText: { fontSize: 15, fontFamily: SANS_BOLD, color: INK },
  headerRightLabel: { fontSize: 8, fontFamily: SANS_BOLD, color: INK_700, textAlign: "right" },
  headerRightDate: { fontSize: 7.5, fontFamily: MONO, color: INK_300, textAlign: "right", marginTop: 2 },

  // Title + profile
  titleRow: { flexDirection: "row", gap: 18 },
  titleCol: { flex: 1.2 },
  h1: { fontSize: 21, fontFamily: SANS_BOLD, color: INK, textTransform: "uppercase", lineHeight: 1.15 },
  eyebrow: { fontSize: 9, fontFamily: MONO_BOLD, color: ACCENT, textTransform: "uppercase", marginTop: 6, letterSpacing: 1 },
  leadPara: { fontSize: 9, color: INK_500, lineHeight: 1.5, marginTop: 8 },
  profileCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD_BG_2,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: MONO_BOLD, fontSize: 11 },
  profileName: { fontSize: 12, fontFamily: SANS_BOLD, color: INK },
  profileMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  profileMetaText: { fontSize: 7.5, fontFamily: MONO, color: INK_400 },

  // Hero
  heroSection: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    padding: 14,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  heroAnimalTile: { width: 92, height: 92, borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: "hidden" },
  heroClusterTile: {
    width: 140,
    borderRadius: 12,
    backgroundColor: CHIP_BG,
    padding: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  heroClusterCell: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: LINE, overflow: "hidden" },
  heroTextCol: { flex: 1 },
  heroKicker: { fontSize: 8.5, fontFamily: MONO_BOLD, color: ACCENT, textTransform: "uppercase", letterSpacing: 1 },
  heroRendering: { fontSize: 8.5, fontFamily: SANS_ITALIC, color: INK_400, marginTop: 3 },
  heroName: { fontSize: 17, fontFamily: SANS_BOLD, color: INK, marginTop: 4 },
  heroStrap: { fontSize: 9, color: INK_500, lineHeight: 1.5, marginTop: 5 },

  // Section header
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  sectionHeaderDot: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: CHIP_BG },
  sectionHeaderText: { fontSize: 9.5, fontFamily: SANS_BOLD, color: INK_700, textTransform: "uppercase", letterSpacing: 1 },

  // Two-column section
  twoCol: { flexDirection: "row", gap: 18 },
  colHalf: { flex: 1 },

  // Core strengths list
  strengthCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 9,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: CHIP_BG },
  strengthHeading: { fontSize: 9.5, fontFamily: SANS_BOLD, color: INK_700 },
  strengthSentence: { fontSize: 8.5, color: INK_400, lineHeight: 1.45, marginTop: 2 },

  // Radar
  radarWrap: { alignItems: "center" },
  radarSubLabel: { fontSize: 7.5, fontFamily: MONO_BOLD, color: ACCENT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  radarLegend: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 },
  radarLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    backgroundColor: CARD_BG_2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    width: "48%",
  },
  radarLegendLabel: { fontSize: 7.5, fontFamily: SANS_BOLD, color: INK_700 },
  radarLegendScore: { fontSize: 7, fontFamily: MONO, color: INK_300, marginLeft: "auto" },

  // Trait scale
  traitCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 10,
  },
  traitSidesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  traitSideText: { fontSize: 7, fontFamily: SANS_BOLD, color: INK_400, textTransform: "uppercase", letterSpacing: 0.5 },
  traitTrack: { height: 4, width: "100%", backgroundColor: LINE, borderRadius: 2, marginBottom: 8, position: "relative" },
  traitTrackMid: { position: "absolute", left: "50%", top: -2, width: 1, height: 8, backgroundColor: LINE },
  traitDot: { position: "absolute", top: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT, borderWidth: 2, borderColor: "#fff" },
  traitHeading: { fontSize: 9.5, fontFamily: SANS_BOLD, color: INK_700 },
  traitSentence: { fontSize: 8.5, color: INK_400, lineHeight: 1.45, marginTop: 2 },

  // Mobility chip
  mobilityCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 10,
  },
  mobilityLabel: { fontSize: 7, fontFamily: SANS_BOLD, color: INK_400, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 },
  mobilityBadge: {
    fontSize: 8.5,
    fontFamily: SANS_BOLD,
    color: ACCENT,
    backgroundColor: CHIP_BG,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  mobilitySentence: { fontSize: 8.5, color: INK_400, lineHeight: 1.45 },

  // Key drivers
  driverCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD_BG,
    padding: 10,
  },
  driverLabel: { fontSize: 7, fontFamily: MONO_BOLD, color: INK_400, textTransform: "uppercase", marginBottom: 4 },
  driverTitle: { fontSize: 10, fontFamily: SANS_BOLD, color: ACCENT },
  driverBody: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, marginTop: 4 },
  driverBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  driverBadge: { fontSize: 7, fontFamily: MONO_BOLD, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, textTransform: "capitalize" },

  // Match cards
  matchCardBig: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 12 },
  matchCardSmall: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 12 },
  matchTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  matchIndexBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
    color: "#fff",
    fontFamily: MONO_BOLD,
    fontSize: 8,
    textAlign: "center",
    paddingTop: 3,
  },
  matchFitBadge: { fontSize: 7.5, fontFamily: MONO_BOLD, color: ACCENT, backgroundColor: CHIP_BG, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  matchFitBadgeMuted: { fontSize: 7.5, fontFamily: MONO_BOLD, color: INK_400, backgroundColor: LINE_SUBTLE, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  matchTagBadge: { fontSize: 6.5, fontFamily: MONO_BOLD, color: ACCENT, borderWidth: 1, borderColor: LINE, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  matchTitle: { fontSize: 10.5, fontFamily: SANS_BOLD, color: INK_700, marginBottom: 5 },
  matchWhat: { fontSize: 8.5, color: INK_400, lineHeight: 1.45 },
  matchNext: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, marginTop: 5 },
  matchNextLabel: { fontFamily: SANS_BOLD, color: INK_700 },
  journeyIntro: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, marginBottom: 10 },
  journeyIntroStrong: { fontFamily: SANS_BOLD, color: INK_700 },
  // A journey is a strip the full width of the page: its four steps run left to right along a
  // line. A strip is short, so a sheet can break after any one of them.
  journeyCard: { borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 10 },
  journeyTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  journeyName: { fontSize: 9.5, fontFamily: SANS_BOLD, color: INK_700, flex: 1, lineHeight: 1.3 },
  journeyStatus: { fontSize: 6, fontFamily: MONO_BOLD, color: ACCENT, backgroundColor: CHIP_BG, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, textTransform: "uppercase" },
  journeySteps: { flexDirection: "row", gap: 10, borderTopWidth: 1, borderTopColor: THEME.accentSoft, paddingTop: 7, marginBottom: 7 },
  journeyStep: { flex: 1, position: "relative" },
  journeyDot: { position: "absolute", left: 0, top: -10.5, width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.accentSoft },
  journeyDotNow: { backgroundColor: ACCENT },
  journeyStepLabel: { fontSize: 5.5, fontFamily: MONO_BOLD, color: INK_400, textTransform: "uppercase", letterSpacing: 0.6 },
  journeyStepText: { fontSize: 7.5, color: INK_500, lineHeight: 1.35, marginTop: 1 },
  journeyStepTextNow: { fontFamily: SANS_BOLD, color: INK_700 },
  journeySkills: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 3, maxWidth: 250 },
  journeySkill: { fontSize: 6.5, fontFamily: SANS_BOLD, color: INK_500, backgroundColor: "#ffffff", borderWidth: 1, borderColor: LINE, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  journeyStory: { fontSize: 7.5, color: INK_400, lineHeight: 1.4 },
  journeyFoot: { fontSize: 6.5, color: INK_300, lineHeight: 1.4, marginTop: 7 },
  matchHonesty: { fontSize: 8, fontFamily: SANS_ITALIC, color: AMBER_FG, lineHeight: 1.4, marginTop: 5 },

  fallbackBox: { borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 16 },
  fallbackText: { fontSize: 9.5, color: INK_500, lineHeight: 1.55 },

  // Verdicts
  verdictCard: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: LINE_SUBTLE, backgroundColor: CARD_BG, padding: 9 },
  verdictText: { fontSize: 8.5, fontFamily: SANS_ITALIC, color: INK_500, lineHeight: 1.45 },

  // Growth / next steps
  tipRow: { flexDirection: "row", gap: 7, alignItems: "flex-start" },
  tipMark: { fontSize: 9, fontFamily: SANS_BOLD, color: GREEN_FG, marginTop: 0.5 },
  tipText: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, flex: 1 },
  stepRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  stepBadge: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: BLUE_FG,
    color: "#fff",
    fontFamily: MONO_BOLD,
    fontSize: 7,
    textAlign: "center",
    paddingTop: 2.5,
  },
  stepText: { fontSize: 8.5, fontFamily: SANS_BOLD, color: INK_500, lineHeight: 1.45, flex: 1 },
  abroadRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: CHIP_BG,
    backgroundColor: CHIP_BG,
    borderRadius: 8,
    padding: 7,
  },
  abroadBadge: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: ACCENT,
    color: "#fff",
    fontFamily: MONO_BOLD,
    fontSize: 7,
    textAlign: "center",
    paddingTop: 2.5,
  },
  abroadText: { fontSize: 8.5, fontFamily: SANS_BOLD, color: INK_700, lineHeight: 1.45, flex: 1 },

  // Quote
  quoteSection: { alignItems: "center", paddingTop: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: LINE_SUBTLE, marginBottom: 12 },
  quoteText: { fontSize: 12, fontFamily: SANS_BOLD, color: INK_500, textAlign: "center", maxWidth: 340, lineHeight: 1.5 },

  // Footer
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LINE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  footerBrand: { fontSize: 9, fontFamily: SANS_BOLD, color: INK_400 },
  footerDisclaimer: { fontSize: 7.5, color: INK_400, lineHeight: 1.4, maxWidth: 320, textAlign: "right" },

  // Rows and blocks. Cards in a row share its width, so a card alone on its row takes all of it.
  pageSpread: { justifyContent: "space-between" },
  row: { flexDirection: "row", gap: 10 },
  // Space under a row is padding inside its unbreakable unit, never a margin: the page-break rule
  // counts a margin as part of what must fit, and would push a row that fits to the next sheet.
  rowGap: { paddingBottom: 10 },
  blockEnd: { paddingBottom: 16 },
  strengthStack: { flexGrow: 1, gap: 7 },
  radarCol: { flexGrow: 1, justifyContent: "center" },
  // Takes up whatever room a sheet has left under its rows, and so can report how much that is.
  roomGauge: { flexGrow: 1 },
  matchBadges: { flexDirection: "row", gap: 5, alignItems: "center" },

  // Tips and steps as panels
  listPanel: { borderRadius: 10, borderWidth: 1, borderColor: LINE_SUBTLE, backgroundColor: CARD_BG, padding: 11 },
  listLines: { flexGrow: 1, justifyContent: "space-around", gap: 7 },
  listRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 7 },
  listRowItem: { flexGrow: 1, flexBasis: 150 },
});

// ---------------------------------------------------------------------------
// One sheet of styles per size. Everything on the page scales together (type,
// padding, gaps, the chart, the animal), so a report can be fitted to whole
// pages: see report-pdf-fit.tsx. The page margins and the corner tag stay put.
// ---------------------------------------------------------------------------

type Sheet = typeof RAW;

const SCALED = new Set([
  "fontSize", "letterSpacing", "gap", "columnGap", "rowGap", "flexBasis", "width", "height", "maxWidth",
  "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingHorizontal", "paddingVertical",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight",
  "borderRadius", "borderBottomLeftRadius", "top", "left", "right", "bottom",
]);
const FIXED = new Set(["page", "pageTag"]);
const sheets = new Map<number, Sheet>();

function sheetFor(k: number): Sheet {
  const ready = sheets.get(k);
  if (ready) return ready;
  const out: Record<string, unknown> = {};
  for (const [name, style] of Object.entries(RAW)) {
    out[name] = FIXED.has(name)
      ? style
      : Object.fromEntries(
          Object.entries(style).map(([prop, v]) => [
            prop,
            typeof v === "number" && SCALED.has(prop) ? Math.round(v * k * 100) / 100 : v,
          ]),
        );
  }
  const sheet = StyleSheet.create(out as Sheet);
  sheets.set(k, sheet);
  return sheet;
}

/** The styles and the size in use, for every part of the document. */
const Look = createContext<{ s: Sheet; k: number }>({ s: RAW, k: 1 });
const useLook = () => useContext(Look);

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Numbered from the real page count, so a section that runs onto a second sheet is still labelled correctly. */
export function PageTag() {
  return (
    <Text style={RAW.pageTag} fixed render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
  );
}

function SectionHeader({ children, dot }: { children: string; dot?: string }) {
  const { s } = useLook();
  return (
    <View style={s.sectionHeaderRow}>
      <View style={[s.sectionHeaderDot, dot ? { backgroundColor: dot } : {}]} />
      <Text style={s.sectionHeaderText}>{children}</Text>
    </View>
  );
}

/** One unbreakable row of the report. `last`: the final row of its section, which carries the gap to the next. */
interface Row {
  body: ReactNode;
  last: boolean;
  /** No spacing under it (the closing row, which ends the report). */
  bare?: boolean;
}
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * How much the first list has to say next to the second (1 = the same). Side by side, each list
 * gets width in this proportion so the two come out close in height. Same rule as report-view.tsx.
 */
function columnShare(first: string[], second: string[]): number {
  const weight = (lines: string[]) => lines.reduce((n, line) => n + line.length + 40, 0);
  return weight(first) / Math.max(1, weight(second));
}

function AnimalTile({ dim }: { dim: RadarDim | "pup" }) {
  const { s, k } = useLook();
  const art = dim === "pup" ? PUP_ART : ANIMAL_ART[dim];
  return (
    <View style={s.heroAnimalTile}>
      <Svg width={92 * k} height={92 * k} viewBox="0 0 200 200">
        <Rect width={200} height={200} fill={art.bg} />
        {art.polygons.map((p, i) => (
          <Polygon key={i} points={p.points} fill={p.fill} stroke={p.fill} strokeWidth={0.6} />
        ))}
      </Svg>
    </View>
  );
}

const ALL_DIMS: RadarDim[] = ["analytical", "people", "creative", "entrepreneurial", "practical", "leadership"];

/** Fallback hero art (more_signal): the full six-animal cast in a 3x2
 * grid, soft — the picture is still forming, so no single animal. */
function AnimalClusterTile({ soft }: { soft: boolean }) {
  const { s, k } = useLook();
  return (
    <View style={[s.heroClusterTile, soft ? { opacity: 0.55 } : {}]}>
      {ALL_DIMS.map((dim) => {
        const art = ANIMAL_ART[dim];
        return (
          <View key={dim} style={s.heroClusterCell}>
            <Svg width={40 * k} height={40 * k} viewBox="0 0 200 200">
              <Rect width={200} height={200} fill={art.bg} />
              {art.polygons.map((p, i) => (
                <Polygon key={i} points={p.points} fill={p.fill} stroke={p.fill} strokeWidth={0.6} />
              ))}
            </Svg>
          </View>
        );
      })}
    </View>
  );
}

/** Hexagon radar drawn as raw Svg, same drawing geometry as the on-screen
 * HexRadar, fed with the six v2 RadarDim scores (0..10 integers). Dimension
 * labels render as a legend list beside the chart rather than absolutely
 * positioned text around it — legibility beats fidelity in a static PDF. */
function PdfRadar({ scores }: { scores: Record<RadarDim, number> }) {
  const { s, k } = useLook();
  const size = 170;
  const cx = size / 2;
  const cy = size / 2;
  // The hexagon fills its square, as on screen.
  const radius = size * 0.46;
  const n = 6;
  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const point = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (v / 10) * radius;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };
  const axesValues = HEX_ORDER.map((d) => scores[d]);
  const polygonPoints = axesValues.map((v, i) => { const p = point(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
  const ringValues = [25, 50, 75, 100];

  return (
    <View style={s.radarWrap}>
      <Svg width={size * k} height={size * k} viewBox={`0 0 ${size} ${size}`}>
        {ringValues.map((rv) => {
          const r = (rv / 100) * radius;
          const pts = [0, 1, 2, 3, 4, 5]
            .map((i) => { const a = angleFor(i); return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`; })
            .join(" ");
          return <Polygon key={rv} points={pts} fill="none" stroke={THEME.accentSoft} strokeWidth={0.75} />;
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = angleFor(i);
          return (
            <Line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * radius}
              y2={cy + Math.sin(a) * radius}
              stroke={THEME.accentSoft}
              strokeWidth={0.75}
            />
          );
        })}
        <Polygon points={polygonPoints} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={1.5} />
      </Svg>
      <View style={s.radarLegend}>
        {HEX_ORDER.map((d) => (
          <View key={d} style={s.radarLegendItem}>
            <Text style={s.radarLegendLabel}>{DIM_LABELS[d]}</Text>
            <Text style={s.radarLegendScore}>{scores[d]}/10</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type Strength = ReportV2["coreStrengths"][number];

/** `half`: one of a pair across the page, each taking half the row. */
function StrengthCard({ c, half }: { c: Strength; half?: boolean }) {
  const { s } = useLook();
  return (
    <View style={[s.strengthCard, half ? { flexBasis: 0 } : {}]}>
      <View style={s.strengthDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.strengthHeading}>
          {c.label}: {c.heading}
        </Text>
        <Text style={s.strengthSentence}>{c.sentence}</Text>
      </View>
    </View>
  );
}

function TraitScale({ heading, sentence, left, right }: { heading: string; sentence: string; left: string; right: string }) {
  const { s, k } = useLook();
  const percent = scalePercent(heading, right);
  return (
    <View style={s.traitCard}>
      <View style={s.traitSidesRow}>
        <Text style={s.traitSideText}>{left}</Text>
        <Text style={s.traitSideText}>{right}</Text>
      </View>
      <View style={s.traitTrack}>
        <View style={s.traitTrackMid} />
        <View style={[s.traitDot, { left: `${percent}%`, marginLeft: -5 * k }]} />
      </View>
      <Text style={s.traitHeading}>{heading}</Text>
      <Text style={s.traitSentence}>{sentence}</Text>
    </View>
  );
}

function MobilityChip({ heading, sentence }: { heading: string; sentence: string }) {
  const { s } = useLook();
  return (
    <View style={s.mobilityCard}>
      <Text style={s.mobilityLabel}>Mobility</Text>
      <Text style={s.mobilityBadge}>{heading}</Text>
      <Text style={s.mobilitySentence}>{sentence}</Text>
    </View>
  );
}

function Trait({ c }: { c: Strength }) {
  if (c.label === "Mobility") return <MobilityChip heading={c.heading} sentence={c.sentence} />;
  const sides = c.label === "Energy" ? ENERGY_SIDES : c.label === "Decision" ? DECISION_SIDES : STRUCTURE_SIDES;
  return <TraitScale heading={c.heading} sentence={c.sentence} left={sides.left} right={sides.right} />;
}

function MatchCardBig({ card, index }: { card: CareerCard; index: number }) {
  const { s } = useLook();
  return (
    <View style={s.matchCardBig}>
      <View style={s.matchTopRow}>
        <Text style={s.matchIndexBadge}>{index + 1}</Text>
        <View style={s.matchBadges}>
          <Text style={s.matchFitBadge}>{card.fit}% FIT</Text>
          <Text style={s.matchTagBadge}>{matchTag(card.career)}</Text>
        </View>
      </View>
      <Text style={s.matchTitle}>{card.career}</Text>
      <Text style={s.matchWhat}>{card.whatLine}</Text>
      <Text style={s.matchNext}>
        <Text style={s.matchNextLabel}>Next step: </Text>
        {card.nextStep}
      </Text>
      {card.honestyLine ? <Text style={s.matchHonesty}>{card.honestyLine}</Text> : null}
    </View>
  );
}

function MatchCardSmall({ card }: { card: CareerCard }) {
  const { s } = useLook();
  return (
    <View style={s.matchCardSmall}>
      <View style={s.matchTopRow}>
        <Text style={s.matchTagBadge}>{matchTag(card.career)}</Text>
        <Text style={s.matchFitBadgeMuted}>{card.fit}% FIT</Text>
      </View>
      <Text style={s.matchTitle}>{card.career}</Text>
      <Text style={s.matchWhat}>{card.whatLine}</Text>
      {card.honestyLine ? <Text style={s.matchHonesty}>{card.honestyLine}</Text> : null}
    </View>
  );
}

const JOURNEY_STEPS: { key: keyof Journey["steps"]; label: string }[] = [
  { key: "degree", label: "Degree" },
  { key: "firstJob", label: "First job" },
  { key: "bridge", label: "Added on top" },
  { key: "now", label: "Now" },
];

function JourneyCard({ journey }: { journey: Journey }) {
  const { s } = useLook();
  const last = JOURNEY_STEPS.length - 1;
  return (
    <View style={s.journeyCard}>
      <View style={s.journeyTopRow}>
        <Text style={s.journeyName}>{journey.label}</Text>
        <View style={s.journeySkills}>
          {journey.skills.map((sk) => (
            <Text key={sk} style={s.journeySkill}>{sk}</Text>
          ))}
        </View>
        <Text style={s.journeyStatus}>{journey.status}</Text>
      </View>
      <View style={s.journeySteps}>
        {JOURNEY_STEPS.map((st, i) => (
          <View key={st.key} style={s.journeyStep}>
            <View style={[s.journeyDot, i === last ? s.journeyDotNow : {}]} />
            <Text style={s.journeyStepLabel}>{st.label}</Text>
            <Text style={[s.journeyStepText, i === last ? s.journeyStepTextNow : {}]}>{journey.steps[st.key]}</Text>
          </View>
        ))}
      </View>
      <Text style={s.journeyStory}>{journey.story}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** The height of a sheet that rows can use: A4, less the margin at its head and foot. */
export const SHEET_HEIGHT = 841.89 - RAW.page.paddingTop - RAW.page.paddingBottom;

/** How report-pdf-fit.tsx steers the layout so the pages come out full. All optional: left out, the report is plain. */
export interface PdfFit {
  /** Sizes everything on the page (1 = the designed size). */
  scale?: number;
  /** The size of each row (by position), where it is not `scale`. The rows of one sheet share a size. */
  sizes?: readonly number[];
  /** Shares out the room a sheet has left over between its rows, so every sheet ends at its foot. */
  spread?: boolean;
  /** The rows (by position) that must start a new sheet. */
  breaks?: ReadonlySet<number>;
  /**
   * For measuring: instead of the report, every row on a page of its own, once at each of these
   * sizes — all the rows at the first size, then all at the second, and so on.
   */
  measure?: readonly number[];
  /** For measuring: told, sheet by sheet in order, how much room is left under its rows, in points. */
  onRoom?: (left: number) => void;
}

/** The rows of the report at one size, in order: those before the First Principles page, and those after it. */
function rowsOf(report: ReportV2, size: number): { opening: Row[]; closing: Row[] } {
  const s = sheetFor(size);
  const t = report.yourType;
  const isFull = report.state === "full";

  const initials = initialsOf(report.header.name);
  const dateStr = formatDateISO(report.header.date);

  // Hero: animal only for a resolved archetype in the "full" state (the hard
  // rule — more_signal never renders fit%, cards, or an animal, even if the
  // pairing math technically produced one).
  const showAnimal = isFull && t.kind === "archetype";
  const heroDim: RadarDim | null = isFull && t.kind === "archetype" ? t.primary : null;

  // The entire archetype/explorer identity — eyebrow, heading, strapline —
  // is gated on isFull. more_signal must never name a type, even when the
  // underlying pairing math (t.kind) technically resolved one.
  const eyebrow =
    isFull && t.kind === "archetype"
      ? `Archetype: ${t.name}`
      : isFull && t.kind === "explorer"
        ? "Type: Explorer Profile"
        : "Type: Gathering More Signal";

  const heroCopy = isFull && t.kind === "explorer" ? t.copy : MORE_SIGNAL_FALLBACK_COPY;

  // The report is a run of rows. No row is split across sheets, a heading stays with the row
  // under it, and the cards of a row share its width — so a sheet breaks between rows, a heading
  // is never left alone at the foot of one, and no row has an empty cell, whatever the report holds.
  // `opening` rows come before the First Principles page and `closing` rows after it.
  const opening: Row[] = [];
  const closing: Row[] = [];
  /** Adds a section: its heading goes with its first row, and its last row carries the gap to the next section. */
  const add = (to: Row[], title: string | null, rows: ReactNode[], dot?: string) =>
    rows.forEach((body, i) =>
      to.push({
        body: (
          <>
            {i === 0 && title ? <SectionHeader dot={dot}>{title}</SectionHeader> : null}
            {body}
          </>
        ),
        last: i === rows.length - 1,
      }),
    );

  add(opening, null, [
    <View key="head" style={s.headerRow}>
      <Text style={s.logoText}>SecureSteps</Text>
      <View>
        <Text style={s.headerRightLabel}>Your SecureSteps Report</Text>
        <Text style={s.headerRightDate}>Generated on: {dateStr}</Text>
      </View>
    </View>,
  ]);

  // The name card is as tall as the title beside it, and a long name wraps inside it.
  add(opening, null, [
    <View key="title" style={s.titleRow}>
      <View style={s.titleCol}>
        <Text style={s.h1}>YOUR PERSONAL PATHWAY INSIGHT</Text>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.leadPara}>
          This is you — decoded. Your answers reveal your natural strengths, what drives you, and the paths that
          will help you thrive.
        </Text>
      </View>
      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profileName}>{report.header.name}</Text>
          <View style={s.profileMetaRow}>
            <Text style={s.profileMetaText}>Profile ID: {report.header.profileId}</Text>
          </View>
          <View style={s.profileMetaRow}>
            <Text style={s.profileMetaText}>{report.header.assessmentName}</Text>
          </View>
        </View>
      </View>
    </View>,
  ]);

  add(opening, null, [
    <View key="hero" style={s.heroSection}>
      {showAnimal && heroDim ? (
        <AnimalTile dim={heroDim} />
      ) : isFull && t.kind === "explorer" ? (
        // The Explorer earns Pup — pulled by every real scent.
        <AnimalTile dim="pup" />
      ) : (
        <AnimalClusterTile soft />
      )}
      <View style={s.heroTextCol}>
        {isFull && t.kind === "archetype" ? (
          <>
            <Text style={s.heroKicker}>{showAnimal ? `THE ${t.animal.toUpperCase()}` : "YOUR TYPE"}</Text>
            {showAnimal && heroDim ? <Text style={s.heroRendering}>{ANIMALS[heroDim].line}</Text> : null}
            <Text style={s.heroName}>{t.name}</Text>
            <Text style={s.heroStrap}>{t.strapline}</Text>
          </>
        ) : isFull && t.kind === "explorer" ? (
          <>
            <Text style={s.heroKicker}>THE PUP</Text>
            <Text style={s.heroRendering}>{PUP.line}</Text>
            <Text style={s.heroName}>The Explorer</Text>
            <Text style={s.heroStrap}>{heroCopy}</Text>
          </>
        ) : (
          <>
            <Text style={s.heroKicker}>STILL BUILDING THE PICTURE</Text>
            <Text style={s.heroStrap}>{heroCopy}</Text>
          </>
        )}
      </View>
    </View>,
  ]);

  if (isFull) {
    // Beside the chart the strengths stack and share the column's height, so three of them
    // fill it as well as four, and the chart sits in the middle of whatever height they take.
    add(opening, null, [
      <View key="strengths" style={s.twoCol}>
        <View style={s.colHalf}>
          <SectionHeader>YOUR CORE STRENGTHS</SectionHeader>
          <View style={s.strengthStack}>
            {report.coreStrengths.map((c) => (
              <StrengthCard key={c.label} c={c} />
            ))}
          </View>
        </View>
        <View style={s.colHalf}>
          <SectionHeader>YOUR PATH FIT SCORE</SectionHeader>
          <Text style={s.radarSubLabel}>SIX-DIMENSION PROFILE</Text>
          <View style={s.radarCol}>
            <PdfRadar scores={report.radar} />
          </View>
        </View>
      </View>,
    ]);
  } else {
    // Without the chart the strengths pair up across the page.
    add(
      opening,
      "YOUR CORE STRENGTHS",
      chunk(report.coreStrengths, 2).map((pair) => (
        <View key={pair[0].label} style={s.row}>
          {pair.map((c) => (
            <StrengthCard key={c.label} c={c} half />
          ))}
        </View>
      )),
    );
  }

  add(
    opening,
    "CAREER TRAITS ANALYSIS",
    chunk(report.coreStrengths, 2).map((pair) => (
      <View key={pair[0].label} style={s.row}>
        {pair.map((c) => (
          <Trait key={c.label} c={c} />
        ))}
      </View>
    )),
  );

  // Key drivers: left out when there is nothing to show; a direction or role on its own takes the full row.
  const driverRows: ReactNode[] = [];
  if (report.domain || report.role) {
    driverRows.push(
      <View key="direction" style={s.row}>
        {report.domain && (
          <View style={s.driverCard}>
            <Text style={s.driverLabel}>Chosen Direction</Text>
            <Text style={s.driverTitle}>{DOMAIN_LABELS[report.domain]}</Text>
            <Text style={s.driverBody}>Where your career cards and next steps below are anchored.</Text>
          </View>
        )}
        {report.role && (
          <View style={s.driverCard}>
            <View style={s.driverBadgeRow}>
              <Text style={s.driverLabel}>Role Resolution</Text>
              <Text
                style={[
                  s.driverBadge,
                  { backgroundColor: CONF_BAND_STYLE[report.role.confBand].bg, color: CONF_BAND_STYLE[report.role.confBand].fg },
                ]}
              >
                {report.role.confBand}
              </Text>
            </View>
            <Text style={s.driverTitle}>
              {ROLE_LABELS[report.role.winner]}
              {report.role.coCandidate ? ` vs ${ROLE_LABELS[report.role.coCandidate]}` : ""}
            </Text>
            <Text style={s.driverBody}>
              Best-fit role resolved from your domain answers
              {report.role.coCandidate ? `, with ${ROLE_LABELS[report.role.coCandidate]} as a close second.` : "."}
            </Text>
          </View>
        )}
      </View>,
    );
  }
  if (report.nextSteps.abroad) {
    driverRows.push(
      <View key="values" style={s.row}>
        <View style={s.driverCard}>
          <Text style={s.driverLabel}>Mobility &amp; Values</Text>
          <Text style={[s.driverBody, { fontFamily: SANS_ITALIC }]}>&ldquo;{report.nextSteps.abroad}&rdquo;</Text>
        </View>
      </View>,
    );
  }
  add(opening, "KEY DRIVERS", driverRows);

  // Future plans: flows on from the sections above, so no sheet is left half empty.
  if (isFull && report.cards) {
    add(opening, "BEST PATH MATCHES FOR YOU", [
      <View key="best" style={s.row}>
        {report.cards.slice(0, 2).map((c, i) => (
          <MatchCardBig key={c.career} card={c} index={i} />
        ))}
      </View>,
    ]);

    if (report.cards.length > 2) {
      add(opening, "ALTERNATIVE PATHWAYS", [
        <View key="alt" style={s.row}>
          {report.cards.slice(2, 4).map((c) => (
            <MatchCardSmall key={c.career} card={c} />
          ))}
        </View>,
      ]);
    }

    // A journey is one row, so a sheet can break after any of them. The introduction goes with
    // the first and the source note with the last.
    add(
      opening,
      "PEOPLE WHO WALKED THIS PATH",
      report.journeys.map((journey, i) => (
        <View key={journey.id}>
          {i === 0 && (
            <Text style={s.journeyIntro}>
              {journeyIntroLead(report.journeys.length)} What they studied, where they began, what they added on
              top of the degree, and where it took them. The road to{" "}
              <Text style={s.journeyIntroStrong}>{report.cards![0].career}</Text> is not theoretical.
            </Text>
          )}
          <JourneyCard journey={journey} />
          {i === report.journeys.length - 1 && (
            <Text style={s.journeyFoot}>
              Profiles as shared on LinkedIn with Secure Steps; not independently verified. Roles and employers as at
              September 2026.
            </Text>
          )}
        </View>
      )),
    );
  } else {
    add(opening, "WHAT HAPPENS NEXT", [
      <View key="next" style={s.fallbackBox}>
        <Text style={s.fallbackText}>No percentages today — they wouldn&apos;t be honest. The fastest way forward is below.</Text>
      </View>,
    ]);
  }

  // As many columns as there are lines.
  if (report.verdicts.length > 0) {
    add(closing, "WE FEEL", [
      <View key="feel" style={s.row}>
        {report.verdicts.slice(0, 3).map((v) => (
          <View key={v.id} style={s.verdictCard}>
            <Text style={s.verdictText}>{v.line}</Text>
          </View>
        ))}
      </View>,
    ]);
  }

  // Tips and steps sit side by side, sharing the width by how much each says. When one says more
  // than twice the other, no split evens them out, so each takes the full width with its lines in a
  // row. With no tips, the steps take the full width.
  const steps = [report.nextSteps.counselling, report.nextSteps.exposure, report.nextSteps.conversation];
  const tipShare = columnShare(report.growthTips, steps);
  const listsStacked = tipShare < 0.5 || tipShare > 2;
  const lines = listsStacked ? s.listRow : s.listLines;
  const line = listsStacked ? s.listRowItem : {};

  const tipsPanel = (
    <View key="tips" style={[s.listPanel, listsStacked ? {} : { flex: Math.min(1.5, Math.max(0.67, tipShare)) }]}>
      <SectionHeader dot={GREEN_BG}>GROWTH TIPS FOR YOU</SectionHeader>
      <View style={lines}>
        {report.growthTips.map((tip, idx) => (
          <View key={idx} style={[s.tipRow, line]}>
            <Text style={s.tipMark}>✓</Text>
            <Text style={s.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  const stepsPanel = (
    <View key="steps" style={[s.listPanel, listsStacked ? {} : { flex: 1 }]}>
      <SectionHeader dot={BLUE_BG}>YOUR NEXT STEPS</SectionHeader>
      <View style={lines}>
        {steps.map((step, idx) => (
          <View key={idx} style={[s.stepRow, line]}>
            <Text style={s.stepBadge}>{idx + 1}</Text>
            <Text style={s.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  add(
    closing,
    null,
    report.growthTips.length === 0
      ? [stepsPanel]
      : listsStacked
        ? [tipsPanel, stepsPanel]
        : [<View key="lists" style={s.row}>{tipsPanel}{stepsPanel}</View>],
  );

  // The fourth step runs the full width under both lists.
  if (report.nextSteps.abroad) {
    add(closing, null, [
      <View key="abroad" style={s.abroadRow}>
        <Text style={s.abroadBadge}>4</Text>
        <Text style={s.abroadText}>{report.nextSteps.abroad}</Text>
      </View>,
    ]);
  }

  // The closing line and the footer are one row, so the footer never lands alone on a sheet.
  closing.push({
    body: (
      <>
        <View style={s.quoteSection}>
          <Text style={s.quoteText}>You don&apos;t need to have it all figured out. You just need the right direction.</Text>
        </View>
        <View style={s.footer}>
          <Text style={s.footerBrand}>SecureSteps</Text>
          <Text style={s.footerDisclaimer}>
            This report reflects what your answers showed about approach and preference. It does not measure ability,
            and no single question decided any line above. · Secure Steps
          </Text>
        </View>
      </>
    ),
    last: false,
    bare: true,
  });

  return { opening, closing };
}

export default function ReportPdfV2({ report, scale = 1, sizes, spread = false, breaks, measure, onRoom }: { report: ReportV2 } & PdfFit) {
  // The rows are built once for each size in use, and each row is taken from the set at its own size.
  const built = new Map<number, Row[]>();
  const rowsAt = (size: number) => {
    if (!built.has(size)) {
      const { opening, closing } = rowsOf(report, size);
      built.set(size, [...opening, ...closing]);
    }
    return built.get(size)!;
  };
  const sizeOf = (at: number) => sizes?.[at] ?? scale;
  const count = rowsOf(report, scale);

  const pageStyle = spread ? [RAW.page, RAW.pageSpread] : RAW.page;

  /** One row of the report at a size, as a unit that is never split across sheets. */
  const unit = (at: number, size: number, startsSheet: boolean, key: string | number) => {
    const s = sheetFor(size);
    const row = rowsAt(size)[at];
    return (
      <Look.Provider key={key} value={{ s, k: size }}>
        <View wrap={false} break={startsSheet} style={row.bare ? {} : row.last ? s.blockEnd : s.rowGap}>
          {row.body}
        </View>
      </Look.Provider>
    );
  };

  /**
   * Fills the room left at the foot of a sheet and, drawing nothing, reports how tall that is.
   * `everySheet`: repeated at the foot of each sheet a flowing page runs to.
   */
  const gauge = (everySheet: boolean) => (
    <Canvas
      fixed={everySheet}
      style={RAW.roomGauge}
      paint={(_painter, _width, height) => {
        // It is also asked to paint before the sheets are laid out, when it has no height yet.
        if (onRoom && Number.isFinite(height)) onRoom(height);
        return null;
      }}
    />
  );

  /** `rows` rows on one flowing page, starting from row `from` of the whole report. */
  const sheetOf = (from: number, rows: number) => (
    <Page size="A4" style={pageStyle}>
      <PageTag />
      {Array.from({ length: rows }, (_, i) => unit(from + i, sizeOf(from + i), breaks?.has(from + i) ?? false, from + i))}
      {onRoom && gauge(true)}
    </Page>
  );

  // Measuring: each row is a page of its own, so no page has anything to carry over to the next
  // and the whole set is laid out in one pass. (One long page broken after every row is laid out
  // again from each break onwards, which takes many times longer.)
  if (measure) {
    const rows = count.opening.length + count.closing.length;
    return (
      <Document>
        {measure.flatMap((size) =>
          Array.from({ length: rows }, (_, i) => (
            <Page key={`${size}-${i}`} size="A4" style={RAW.page}>
              {unit(i, size, false, "row")}
              {gauge(false)}
            </Page>
          )),
        )}
      </Document>
    );
  }

  return (
    <Document title={`${report.header.assessmentName} — ${report.header.name}`}>
      {report.thinking ? (
        // With the First Principles page the report keeps three parts, that page in the middle.
        <>
          {sheetOf(0, count.opening.length)}
          <ThinkingPdfPage t={report.thinking} tag={<PageTag />} />
          {sheetOf(count.opening.length, count.closing.length)}
        </>
      ) : (
        // Otherwise it is one continuous run: nothing is pushed to a fresh sheet, and
        // report-pdf-fit.tsx breaks, sizes and spreads it so that every sheet is full.
        sheetOf(0, count.opening.length + count.closing.length)
      )}
    </Document>
  );
}