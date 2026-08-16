import { Document, Line, Page, Polygon, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { ANIMALS, DIM_LABELS, DOMAIN_LABELS, ROLE_LABELS } from "./types";
import type { CareerCard, RadarDim, ReportV2 } from "./types";
import { ANIMAL_ART } from "./animal-geometry";

// ---------------------------------------------------------------------------
// react-pdf counterpart of components/v2/report-view.tsx. Mirrors its 3-page
// structure, section order, copy, and conditional logic exactly. react-pdf
// has no Tailwind, no client-only deps (framer-motion, lucide-react) and no
// custom font files here — base-14 fonts only (Helvetica for body/headings,
// Courier for mono eyebrows), per the PDF translation rules. Because of that
// constraint, several small helpers below are *intentional* duplicates of
// logic that lives in report-view.tsx (date/initials formatting, the
// heading→percent slider math, the six-axis hex order, the more_signal
// fallback copy) rather than imports — importing the component file would
// drag "use client" / framer-motion / lucide-react into the PDF bundle.
// ---------------------------------------------------------------------------

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
const LINE = "#E5E7EB";
const LINE_SUBTLE = "#EEF0F3";
const ACCENT = "#6e6ef0";
const CHIP_BG = "#f3f0fc";
const CARD_BG = "#fbfaff";
const CARD_BG_2 = "#f8f7fd";
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

const s = StyleSheet.create({
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
    marginBottom: 16,
  },
  logoText: { fontSize: 15, fontFamily: SANS_BOLD, color: INK },
  headerRightLabel: { fontSize: 8, fontFamily: SANS_BOLD, color: INK_700, textAlign: "right" },
  headerRightDate: { fontSize: 7.5, fontFamily: MONO, color: INK_300, textAlign: "right", marginTop: 2 },

  // Title + profile
  titleRow: { flexDirection: "row", gap: 18, marginBottom: 18 },
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
    marginBottom: 18,
  },
  heroAnimalTile: { width: 92, height: 92, borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: "hidden" },
  heroPlaceholderTile: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: CHIP_BG,
    alignItems: "center",
    justifyContent: "center",
  },
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
  twoCol: { flexDirection: "row", gap: 18, marginBottom: 18 },
  colHalf: { flex: 1 },

  // Core strengths list
  strengthCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 9,
    marginBottom: 7,
    flexDirection: "row",
    gap: 8,
  },
  strengthDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: CHIP_BG, marginTop: 1 },
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
    width: "31%",
  },
  radarLegendLabel: { fontSize: 7.5, fontFamily: SANS_BOLD, color: INK_700 },
  radarLegendScore: { fontSize: 7, fontFamily: MONO, color: INK_300, marginLeft: "auto" },

  // Trait scale
  traitCard: {
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 10,
    marginBottom: 10,
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
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE_SUBTLE,
    backgroundColor: CARD_BG,
    padding: 10,
    marginBottom: 10,
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
    width: "48%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: CARD_BG,
    padding: 10,
    marginBottom: 10,
  },
  driverCardFull: { width: "100%" },
  driverLabel: { fontSize: 7, fontFamily: MONO_BOLD, color: INK_400, textTransform: "uppercase", marginBottom: 4 },
  driverTitle: { fontSize: 10, fontFamily: SANS_BOLD, color: ACCENT },
  driverBody: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, marginTop: 4 },
  driverBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  driverBadge: { fontSize: 7, fontFamily: MONO_BOLD, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, textTransform: "capitalize" },

  // Match cards
  matchGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  matchCardBig: { width: "47%", borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 12 },
  matchCardSmall: { width: "47%", borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 12 },
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
  matchHonesty: { fontSize: 8, fontFamily: SANS_ITALIC, color: AMBER_FG, lineHeight: 1.4, marginTop: 5 },

  fallbackBox: { borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG_2, padding: 16, maxWidth: "70%" },
  fallbackText: { fontSize: 9.5, color: INK_500, lineHeight: 1.55 },

  // Verdicts
  verdictRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  verdictCard: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: LINE_SUBTLE, backgroundColor: CARD_BG, padding: 9 },
  verdictText: { fontSize: 8.5, fontFamily: SANS_ITALIC, color: INK_500, lineHeight: 1.45 },

  // Growth / next steps
  stepColRow: { flexDirection: "row", gap: 18, marginBottom: 18 },
  stepColHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  stepColHeaderDotGreen: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: GREEN_BG },
  stepColHeaderDotBlue: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: BLUE_BG },
  tipRow: { flexDirection: "row", gap: 7, marginBottom: 8, alignItems: "flex-start" },
  tipMark: { fontSize: 9, fontFamily: SANS_BOLD, color: GREEN_FG, marginTop: 0.5 },
  tipText: { fontSize: 8.5, color: INK_500, lineHeight: 1.45, flex: 1 },
  stepRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "flex-start" },
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
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PageTag({ n }: { n: number }) {
  return (
    <Text style={s.pageTag}>PAGE {n} OF 3</Text>
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <View style={s.sectionHeaderRow}>
      <View style={s.sectionHeaderDot} />
      <Text style={s.sectionHeaderText}>{children}</Text>
    </View>
  );
}

function AnimalTile({ dim }: { dim: RadarDim }) {
  const art = ANIMAL_ART[dim];
  return (
    <View style={s.heroAnimalTile}>
      <Svg width={92} height={92} viewBox="0 0 200 200">
        <Rect width={200} height={200} fill={art.bg} />
        {art.polygons.map((p, i) => (
          <Polygon key={i} points={p.points} fill={p.fill} stroke={p.fill} strokeWidth={0.6} />
        ))}
      </Svg>
    </View>
  );
}

/** Hexagon radar drawn as raw Svg, same drawing geometry as the on-screen
 * HexRadar, fed with the six v2 RadarDim scores (0..10 integers). Dimension
 * labels render as a legend list beside the chart rather than absolutely
 * positioned text around it — legibility beats fidelity in a static PDF. */
function PdfRadar({ scores }: { scores: Record<RadarDim, number> }) {
  const size = 170;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;
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
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {ringValues.map((rv) => {
          const r = (rv / 100) * radius;
          const pts = [0, 1, 2, 3, 4, 5]
            .map((i) => { const a = angleFor(i); return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`; })
            .join(" ");
          return <Polygon key={rv} points={pts} fill="none" stroke="rgba(110,110,240,0.15)" strokeWidth={0.75} />;
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
              stroke="rgba(110,110,240,0.2)"
              strokeWidth={0.75}
            />
          );
        })}
        <Polygon points={polygonPoints} fill="rgba(110,110,240,0.18)" stroke={ACCENT} strokeWidth={1.5} />
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

function TraitScale({ heading, sentence, left, right }: { heading: string; sentence: string; left: string; right: string }) {
  const percent = scalePercent(heading, right);
  return (
    <View style={s.traitCard}>
      <View style={s.traitSidesRow}>
        <Text style={s.traitSideText}>{left}</Text>
        <Text style={s.traitSideText}>{right}</Text>
      </View>
      <View style={s.traitTrack}>
        <View style={s.traitTrackMid} />
        <View style={[s.traitDot, { left: `${percent}%`, marginLeft: -5 }]} />
      </View>
      <Text style={s.traitHeading}>{heading}</Text>
      <Text style={s.traitSentence}>{sentence}</Text>
    </View>
  );
}

function MobilityChip({ heading, sentence }: { heading: string; sentence: string }) {
  return (
    <View style={s.mobilityCard}>
      <Text style={s.mobilityLabel}>Mobility</Text>
      <Text style={s.mobilityBadge}>{heading}</Text>
      <Text style={s.mobilitySentence}>{sentence}</Text>
    </View>
  );
}

function MatchCardBig({ card, index }: { card: CareerCard; index: number }) {
  return (
    <View style={s.matchCardBig}>
      <View style={s.matchTopRow}>
        <Text style={s.matchIndexBadge}>{index + 1}</Text>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function ReportPdfV2({ report }: { report: ReportV2 }) {
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

  return (
    <Document title={`${report.header.assessmentName} — ${report.header.name}`}>
      {/* PAGE 1: Personal Assessment */}
      <Page size="A4" style={s.page}>
        <PageTag n={1} />

        <View style={s.headerRow}>
          <Text style={s.logoText}>SecureSteps</Text>
          <View>
            <Text style={s.headerRightLabel}>Your SecureSteps Report</Text>
            <Text style={s.headerRightDate}>Generated on: {dateStr}</Text>
          </View>
        </View>

        <View style={s.titleRow}>
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
            <View>
              <Text style={s.profileName}>{report.header.name}</Text>
              <View style={s.profileMetaRow}>
                <Text style={s.profileMetaText}>Profile ID: {report.header.profileId}</Text>
              </View>
              <View style={s.profileMetaRow}>
                <Text style={s.profileMetaText}>{report.header.assessmentName}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.heroSection}>
          {showAnimal && heroDim ? (
            <AnimalTile dim={heroDim} />
          ) : (
            <View style={s.heroPlaceholderTile}>
              <Svg width={40} height={40} viewBox="0 0 40 40">
                <Line x1={8} y1={20} x2={32} y2={20} stroke={ACCENT} strokeWidth={1.5} opacity={0.6} />
                <Line x1={20} y1={8} x2={20} y2={32} stroke={ACCENT} strokeWidth={1.5} opacity={0.6} />
                <Polygon points="20,12 24,20 20,28 16,20" fill="none" stroke={ACCENT} strokeWidth={1.5} opacity={0.8} />
              </Svg>
            </View>
          )}
          <View style={s.heroTextCol}>
            {isFull && t.kind === "archetype" ? (
              <>
                <Text style={s.heroKicker}>{showAnimal ? `THE ${t.animal.toUpperCase()}` : "YOUR TYPE"}</Text>
                {showAnimal && heroDim ? <Text style={s.heroRendering}>{ANIMALS[heroDim].line}</Text> : null}
                <Text style={s.heroName}>{t.name}</Text>
                <Text style={s.heroStrap}>{t.strapline}</Text>
              </>
            ) : (
              <>
                <Text style={s.heroKicker}>{isFull && t.kind === "explorer" ? "A BRIDGE PROFILE" : "STILL BUILDING THE PICTURE"}</Text>
                <Text style={s.heroStrap}>{heroCopy}</Text>
              </>
            )}
          </View>
        </View>

        <View style={s.twoCol}>
          <View style={s.colHalf}>
            <SectionHeader>YOUR CORE STRENGTHS</SectionHeader>
            {report.coreStrengths.map((c) => (
              <View key={c.label} style={s.strengthCard}>
                <View style={s.strengthDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.strengthHeading}>
                    {c.label}: {c.heading}
                  </Text>
                  <Text style={s.strengthSentence}>{c.sentence}</Text>
                </View>
              </View>
            ))}
          </View>
          {isFull && (
            <View style={s.colHalf}>
              <SectionHeader>YOUR PATH FIT SCORE</SectionHeader>
              <Text style={s.radarSubLabel}>SIX-DIMENSION PROFILE</Text>
              <PdfRadar scores={report.radar} />
            </View>
          )}
        </View>

        <View style={{ marginBottom: 18 }}>
          <SectionHeader>CAREER TRAITS ANALYSIS</SectionHeader>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {report.coreStrengths.map((c) =>
              c.label === "Mobility" ? (
                <MobilityChip key={c.label} heading={c.heading} sentence={c.sentence} />
              ) : (
                <TraitScale
                  key={c.label}
                  heading={c.heading}
                  sentence={c.sentence}
                  left={c.label === "Energy" ? ENERGY_SIDES.left : c.label === "Decision" ? DECISION_SIDES.left : STRUCTURE_SIDES.left}
                  right={c.label === "Energy" ? ENERGY_SIDES.right : c.label === "Decision" ? DECISION_SIDES.right : STRUCTURE_SIDES.right}
                />
              ),
            )}
          </View>
        </View>

        <View>
          <SectionHeader>KEY DRIVERS</SectionHeader>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
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
            {report.nextSteps.abroad && (
              <View style={[s.driverCard, s.driverCardFull]}>
                <Text style={s.driverLabel}>Mobility &amp; Values</Text>
                <Text style={[s.driverBody, { fontFamily: SANS_ITALIC }]}>&ldquo;{report.nextSteps.abroad}&rdquo;</Text>
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* PAGE 2: Future Plans */}
      <Page size="A4" style={s.page}>
        <PageTag n={2} />

        {isFull && report.cards ? (
          <>
            <View style={{ marginBottom: 18 }}>
              <SectionHeader>BEST PATH MATCHES FOR YOU</SectionHeader>
              <View style={s.matchGrid}>
                {report.cards.slice(0, 2).map((c, i) => (
                  <MatchCardBig key={c.career} card={c} index={i} />
                ))}
              </View>
            </View>

            {report.cards.length > 2 && (
              <View>
                <SectionHeader>ALTERNATIVE PATHWAYS</SectionHeader>
                <View style={s.matchGrid}>
                  {report.cards.slice(2, 4).map((c) => (
                    <MatchCardSmall key={c.career} card={c} />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View>
            <SectionHeader>WHAT HAPPENS NEXT</SectionHeader>
            <View style={s.fallbackBox}>
              <Text style={s.fallbackText}>No percentages today — they wouldn&apos;t be honest. The fastest way forward is below.</Text>
            </View>
          </View>
        )}
      </Page>

      {/* PAGE 3: Next Secure Step */}
      <Page size="A4" style={s.page}>
        <PageTag n={3} />

        {report.verdicts.length > 0 && (
          <View style={{ paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: LINE_SUBTLE, marginBottom: 18 }}>
            <SectionHeader>WE FEEL</SectionHeader>
            <View style={s.verdictRow}>
              {report.verdicts.slice(0, 3).map((v) => (
                <View key={v.id} style={s.verdictCard}>
                  <Text style={s.verdictText}>{v.line}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.stepColRow}>
          <View style={{ flex: 1 }}>
            <View style={s.stepColHeaderRow}>
              <View style={s.stepColHeaderDotGreen} />
              <Text style={s.sectionHeaderText}>GROWTH TIPS FOR YOU</Text>
            </View>
            {report.growthTips.map((tip, idx) => (
              <View key={idx} style={s.tipRow}>
                <Text style={s.tipMark}>✓</Text>
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1 }}>
            <View style={s.stepColHeaderRow}>
              <View style={s.stepColHeaderDotBlue} />
              <Text style={s.sectionHeaderText}>YOUR NEXT STEPS</Text>
            </View>
            {[report.nextSteps.counselling, report.nextSteps.exposure, report.nextSteps.conversation].map((step, idx) => (
              <View key={idx} style={s.stepRow}>
                <Text style={s.stepBadge}>{idx + 1}</Text>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
            {report.nextSteps.abroad && (
              <View style={s.abroadRow}>
                <Text style={s.abroadBadge}>4</Text>
                <Text style={s.abroadText}>{report.nextSteps.abroad}</Text>
              </View>
            )}
          </View>
        </View>

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
      </Page>
    </Document>
  );
}
