"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Palette,
  UserCheck,
  Users,
  Settings,
  Rocket,
  Star,
  TrendingUp,
  Award,
  Leaf,
  Send,
  CheckCircle2,
  Briefcase,
  Code,
  LineChart,
  PenTool,
  Compass,
  Calendar,
  Target,
  Globe,
  Quote,
  Lightbulb,
  Zap,
  Scale,
  LayoutGrid,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ANIMALS, DOMAIN_LABELS, DIM_LABELS, ROLE_LABELS } from "@/lib/v2/types";
import type { ReportV2, RadarDim, CareerCard } from "@/lib/v2/types";
import { ANIMAL_ART } from "@/lib/v2/animal-geometry";
import { AnimalArt } from "./animal-art";

// ---------------------------------------------------------------------------
// Small formatting helpers (no Date.now(), no new Date() — everything comes
// from report.header.date, which is a "YYYY-MM-DD" string).
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** All six radar dims in display order — used by the fallback hero cluster. */
const ALL_DIMS: RadarDim[] = ["analytical", "people", "creative", "entrepreneurial", "practical", "leadership"];

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

const MATCH_ICONS: Array<{ test: RegExp; icon: typeof Briefcase }> = [
  { test: /business|management|commerce|sales|operator|advisory|hr/i, icon: Briefcase },
  { test: /engineer|developer|data|tech|code|product-tech|infrastructure|build/i, icon: Code },
  { test: /finance|market|risk|deal|econom|quant|analyst/i, icon: LineChart },
  { test: /design|creative|brand|content|media/i, icon: PenTool },
];

function getMatchIcon(title: string) {
  const found = MATCH_ICONS.find((m) => m.test.test(title));
  return found ? found.icon : Compass;
}

const DIM_ICONS: Record<RadarDim, typeof Brain> = {
  analytical: Brain,
  creative: Palette,
  leadership: UserCheck,
  people: Users,
  practical: Settings,
  entrepreneurial: Rocket,
};

const STRENGTH_ICONS: Record<string, typeof Zap> = {
  Energy: Zap,
  Decision: Scale,
  Structure: LayoutGrid,
  Mobility: MapPin,
};

// Six axes, same clock positions the legacy hexagon uses: top, upper-right,
// lower-right, bottom, lower-left, upper-left.
const HEX_ORDER: RadarDim[] = ["analytical", "creative", "leadership", "people", "practical", "entrepreneurial"];

const CONF_BAND_STYLE: Record<string, string> = {
  confirmed: "bg-[#e8f8ef] text-green-700",
  provisional: "bg-[#fff7ed] text-amber-700",
  mismatch: "bg-[#fef2f2] text-red-600",
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ icon: Icon, children }: { icon: typeof Star; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
        <Icon className="size-3.5" strokeWidth={3} />
      </div>
      <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">{children}</h2>
    </div>
  );
}

function PageTag({ n }: { n: number }) {
  return (
    <div className="absolute top-0 right-0 bg-[#f3f0fc] text-[#6e6ef0] font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] z-10 border-b border-l border-line/50 shadow-sm">
      PAGE {n} OF 3
    </div>
  );
}

function TraitScale({
  heading,
  sentence,
  left,
  right,
}: {
  heading: string;
  sentence: string;
  left: string;
  right: string;
}) {
  const percent = scalePercent(heading, right);
  return (
    <div className="rounded-xl border border-line/50 bg-[#fbfaff]/50 hover:bg-[#fbfaff] transition-all p-3.5 space-y-2.5">
      <div className="flex justify-between text-[10px] font-bold text-ink-400 uppercase tracking-wide">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-1.5 w-full bg-line/50 rounded-full">
        <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
        <div
          className="absolute top-1/2 size-3 rounded-full bg-[#6e6ef0] border-2 border-white shadow -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${percent}%` }}
        />
      </div>
      <div>
        <p className="text-[13px] font-bold text-ink-700">{heading}</p>
        <p className="text-[11.5px] text-ink-500 leading-relaxed mt-0.5">{sentence}</p>
      </div>
    </div>
  );
}

function MobilityChip({ heading, sentence }: { heading: string; sentence: string }) {
  return (
    <div className="rounded-xl border border-line/50 bg-[#fbfaff]/50 hover:bg-[#fbfaff] transition-all p-3.5 space-y-2.5">
      <div className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Mobility</div>
      <span className="inline-block text-[12px] font-extrabold text-[#6e6ef0] bg-[#f3f0fc] rounded-md px-2.5 py-1">
        {heading}
      </span>
      <p className="text-[11.5px] text-ink-500 leading-relaxed">{sentence}</p>
    </div>
  );
}

// Hexagon radar, same drawing logic as the legacy DashboardRadarChart, fed
// with the six v2 RadarDim scores (already 0..10 integers).
function HexRadar({ scores }: { scores: Record<RadarDim, number> }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = 6;
  const ringValues = [25, 50, 75, 100];
  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const point = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (v / 10) * radius;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };
  const axesValues = HEX_ORDER.map((d) => scores[d]);
  const polygonPoints = axesValues.map((v, i) => { const p = point(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");

  const labelPositions = [
    "absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center",
    "absolute top-[18%] -right-2 sm:right-0 flex flex-col items-start",
    "absolute bottom-[18%] -right-2 sm:right-0 flex flex-col items-start",
    "absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center",
    "absolute bottom-[18%] -left-2 sm:left-0 flex flex-col items-end",
    "absolute top-[18%] -left-2 sm:left-0 flex flex-col items-end",
  ];
  const scoreAlign = ["", "pl-4", "pl-4", "", "pr-4", "pr-4"];

  return (
    <div className="relative w-full max-w-[290px] sm:max-w-[360px] h-[260px] sm:h-[320px] flex items-center justify-center mt-2 shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-[140px] h-[140px] sm:w-[220px] sm:h-[220px] max-w-full h-auto">
        {ringValues.map((rv) => {
          const r = (rv / 100) * radius;
          return (
            <polygon
              key={rv}
              points={[0, 1, 2, 3, 4, 5].map((i) => { const a = angleFor(i); return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`; }).join(" ")}
              fill="none"
              stroke="rgba(110, 110, 240, 0.08)"
              strokeWidth={1}
            />
          );
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = angleFor(i);
          return (
            <line key={`spoke-${i}`} x1={cx} y1={cy} x2={cx + Math.cos(a) * radius} y2={cy + Math.sin(a) * radius} stroke="rgba(110, 110, 240, 0.12)" strokeWidth={1} />
          );
        })}
        <polygon points={polygonPoints} fill="rgba(110, 110, 240, 0.14)" stroke="#6e6ef0" strokeWidth={2} strokeLinejoin="round" />
        {axesValues.map((v, i) => {
          const p = point(i, v);
          return <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill="#6e6ef0" stroke="white" strokeWidth={1.5} />;
        })}
      </svg>
      {HEX_ORDER.map((d, i) => {
        const Icon = DIM_ICONS[d];
        return (
          <div key={d} className={labelPositions[i]}>
            <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
              <Icon className="size-3.5 text-[#6e6ef0]" />
              <span>{DIM_LABELS[d]}</span>
            </div>
            <span className={`font-mono text-[9px] text-ink-400 font-bold mt-0.5 ${scoreAlign[i]}`}>{scores[d]}/10</span>
          </div>
        );
      })}
    </div>
  );
}

function MatchCardBig({ card, index }: { card: CareerCard; index: number }) {
  const Icon = getMatchIcon(card.career);
  return (
    <div className="rounded-[16px] p-5 border border-line bg-[#f8f7fd]/30 hover:bg-[#f8f7fd]/60 transition-all space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="size-6 rounded-full bg-[#6e6ef0] text-white font-mono text-[11px] font-extrabold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-black text-[#6e6ef0] bg-[#f3f0fc] px-2 py-0.5 rounded-md">
            {card.fit}% FIT
          </span>
          <div className="size-8 rounded-xl bg-white border border-line flex items-center justify-center text-[#6e6ef0] shrink-0 shadow-sm">
            <Icon className="size-5" />
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-[14.5px] font-extrabold text-ink-700 leading-snug">{card.career}</h4>
        <p className="text-[12px] text-ink-500 leading-relaxed mt-2.5">{card.whatLine}</p>
        <p className="text-[12px] text-ink-600 leading-relaxed mt-2">
          <span className="font-semibold text-ink-700">Next step:</span> {card.nextStep}
        </p>
        {card.honestyLine && (
          <p className="text-[11.5px] italic text-amber-700 leading-relaxed mt-2">{card.honestyLine}</p>
        )}
      </div>
    </div>
  );
}

function MatchCardSmall({ card }: { card: CareerCard }) {
  const Icon = getMatchIcon(card.career);
  return (
    <div className="rounded-[16px] p-5 border border-line bg-[#f8f7fd]/30 hover:bg-[#f8f7fd]/60 transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="size-8 rounded-xl bg-white border border-line flex items-center justify-center text-[#6e6ef0] shadow-sm">
          <Icon className="size-4" />
        </div>
        <span className="text-[9px] font-mono font-black text-ink-500 bg-line/50 px-2 py-0.5 rounded-md">
          {card.fit}% FIT
        </span>
      </div>
      <div>
        <h4 className="text-[13.5px] font-extrabold text-ink-700 leading-snug">{card.career}</h4>
        <p className="text-[11.5px] text-ink-500 leading-relaxed mt-1.5">{card.whatLine}</p>
        {card.honestyLine && (
          <p className="text-[11px] italic text-amber-700 leading-relaxed mt-2">{card.honestyLine}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function ReportViewV2({ report }: { report: ReportV2 }) {
  const t = report.yourType;
  const isFull = report.state === "full";

  const initials = useMemo(() => initialsOf(report.header.name), [report.header.name]);
  const dateStr = useMemo(() => formatDateISO(report.header.date), [report.header.date]);

  // Hero: animal only for a resolved archetype in the "full" state (the
  // hard rule — more_signal never renders fit%, cards, or an animal, even
  // if the pairing math technically produced one).
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
    <article className="max-w-4xl mx-auto px-3 sm:px-6 pb-20 mt-4 sm:mt-8 space-y-8">
      {/* PAGE 1: Personal Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
      >
        <PageTag n={1} />

        {/* Header Block */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="flex items-center gap-2.5">
            <Logo className="size-7 text-[#6e6ef0]" />
            <span className="text-[24px] font-black tracking-tight text-ink font-sans">SecureSteps</span>
          </div>
          <div className="flex items-center gap-4 pl-0 sm:pl-4 border-l-0 sm:border-l border-line/60">
            <div className="text-right">
              <div className="text-[11px] font-bold text-ink-700 tracking-wider">Your SecureSteps Report</div>
              <div className="text-[10px] text-ink-300 font-mono mt-0.5">Generated on: {dateStr}</div>
            </div>
          </div>
        </header>

        {/* Title & Profile Card */}
        <section className="grid md:grid-cols-[1.2fr,1fr] gap-8 py-8 items-start">
          <div className="space-y-4">
            <h1 className="text-[32px] sm:text-[40px] font-black leading-tight text-ink uppercase tracking-tight">
              YOUR PERSONAL PATHWAY INSIGHT
            </h1>
            <div className="text-[15px] font-extrabold text-[#6e6ef0] tracking-wider uppercase font-mono">{eyebrow}</div>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-ink-500 max-w-md">
              This is you — decoded. Your answers reveal your natural strengths, what drives you, and the paths
              that will help you thrive.
            </p>
          </div>

          <div className="rounded-[18px] p-6 border border-line bg-[#f8f7fd]/40 flex gap-4 items-center">
            <div className="size-14 rounded-full bg-[#0a0e1a] text-white flex items-center justify-center font-mono text-[18px] font-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h3 className="text-[17px] font-extrabold text-ink leading-tight truncate">{report.header.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono">
                  <Calendar className="size-3.5" />
                  <span>Profile ID: {report.header.profileId}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono">
                  <Target className="size-3.5" />
                  <span>{report.header.assessmentName}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HERO — signature type panel */}
        <section className="py-6 border-t border-line/50">
          <div className="rounded-[20px] border border-line bg-[#fbfaff]/60 p-5 sm:p-8 grid sm:grid-cols-[auto,1fr] gap-6 sm:gap-8 items-center">
            {showAnimal && heroDim ? (
              <div
                className="relative w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] md:w-[270px] md:h-[270px] overflow-hidden rounded-2xl border border-line shrink-0 mx-auto sm:mx-0 [&>svg]:w-full [&>svg]:h-full"
                style={{ backgroundColor: ANIMAL_ART[heroDim].bg }}
              >
                <AnimalArt dim={heroDim} size={280} />
              </div>
            ) : (
              // No single animal earned — show the whole cast instead of a
              // blank tile: bold for the Explorer (pulled in many directions),
              // soft for more_signal (picture still forming).
              <div
                className={`grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-[#f3f0fc] shrink-0 mx-auto sm:mx-0 ${
                  isFull && t.kind === "explorer" ? "" : "opacity-55 saturate-[0.6]"
                }`}
              >
                {ALL_DIMS.map((d) => (
                  <div
                    key={d}
                    className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] rounded-xl overflow-hidden border border-line/50 [&>svg]:w-full [&>svg]:h-full"
                    style={{ backgroundColor: ANIMAL_ART[d].bg }}
                  >
                    <AnimalArt dim={d} size={64} />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 text-center sm:text-left">
              {isFull && t.kind === "archetype" ? (
                <>
                  <p className="text-[13px] font-mono font-bold text-[#6e6ef0] uppercase tracking-widest">
                    {showAnimal ? `THE ${t.animal.toUpperCase()}` : "YOUR TYPE"}
                  </p>
                  {showAnimal && heroDim && (
                    <p className="text-[13px] italic text-ink-400">{ANIMALS[heroDim].line}</p>
                  )}
                  <h2 className="text-[26px] sm:text-[32px] font-black text-ink leading-tight">{t.name}</h2>
                  <p className="text-[14px] sm:text-[15px] text-ink-600 leading-relaxed max-w-xl">{t.strapline}</p>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-mono font-bold text-[#6e6ef0] uppercase tracking-widest">
                    {isFull && t.kind === "explorer" ? "A BRIDGE PROFILE" : "STILL BUILDING THE PICTURE"}
                  </p>
                  <p className="text-[14px] sm:text-[15px] text-ink-600 leading-relaxed max-w-xl">{heroCopy}</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Core Strengths + Path Fit Radar — the radar (and its header) is
            full-state only; more_signal flows straight from strengths to
            the page-2 fallback content, same as the prior design. */}
        <section className={isFull ? "grid md:grid-cols-2 gap-10 py-6 border-t border-line/50" : "py-6 border-t border-line/50"}>
          <div className="space-y-6">
            <SectionHeader icon={Star}>YOUR CORE STRENGTHS</SectionHeader>
            <div className="space-y-3">
              {report.coreStrengths.map((s) => {
                const Icon = STRENGTH_ICONS[s.label] ?? Star;
                return (
                  <div
                    key={s.label}
                    className="rounded-[14px] p-4 border border-line/40 bg-[#fbfaff]/60 hover:bg-[#fbfaff] transition-all flex gap-3.5 items-start"
                  >
                    <div className="size-8 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0] shrink-0 mt-0.5">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-ink-700">
                        {s.label}: {s.heading}
                      </h4>
                      <p className="text-[12px] text-ink-500 leading-relaxed mt-1">{s.sentence}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isFull && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="flex flex-col gap-1.5 self-start">
                <SectionHeader icon={TrendingUp}>YOUR PATH FIT SCORE</SectionHeader>
                <div className="text-[11px] font-extrabold text-[#6e6ef0] tracking-wider uppercase font-mono pl-8.5">
                  SIX-DIMENSION PROFILE
                </div>
              </div>
              <HexRadar scores={report.radar} />
            </div>
          )}
        </section>

        {/* Career Traits */}
        <section className="py-6 border-t border-line/50 space-y-6">
          <SectionHeader icon={LineChart}>CAREER TRAITS ANALYSIS</SectionHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            {report.coreStrengths.map((s) =>
              s.label === "Mobility" ? (
                <MobilityChip key={s.label} heading={s.heading} sentence={s.sentence} />
              ) : (
                <TraitScale
                  key={s.label}
                  heading={s.heading}
                  sentence={s.sentence}
                  left={s.label === "Energy" ? ENERGY_SIDES.left : s.label === "Decision" ? DECISION_SIDES.left : STRUCTURE_SIDES.left}
                  right={s.label === "Energy" ? ENERGY_SIDES.right : s.label === "Decision" ? DECISION_SIDES.right : STRUCTURE_SIDES.right}
                />
              ),
            )}
          </div>
        </section>

        {/* Key Drivers */}
        <section className="py-6 border-t border-line/50 space-y-6 mt-2">
          <SectionHeader icon={Compass}>KEY DRIVERS</SectionHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            {report.domain && (
              <div className="rounded-[14px] p-4 border border-line bg-[#fbfaff]/60 shadow-sm space-y-2">
                <div className="text-[10px] font-bold text-ink-400 font-mono uppercase">Chosen Direction</div>
                <h4 className="text-[14px] font-extrabold text-[#6e6ef0]">{DOMAIN_LABELS[report.domain]}</h4>
                <p className="text-[12px] text-ink-600 leading-relaxed">
                  Where your career cards and next steps below are anchored.
                </p>
              </div>
            )}
            {report.role && (
              <div className="rounded-[14px] p-4 border border-line bg-[#fbfaff]/60 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-bold text-ink-400 font-mono uppercase">Role Resolution</div>
                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md capitalize ${CONF_BAND_STYLE[report.role.confBand]}`}>
                    {report.role.confBand}
                  </span>
                </div>
                <h4 className="text-[14px] font-extrabold text-[#6e6ef0]">
                  {ROLE_LABELS[report.role.winner]}
                  {report.role.coCandidate ? ` vs ${ROLE_LABELS[report.role.coCandidate]}` : ""}
                </h4>
                <p className="text-[12px] text-ink-600 leading-relaxed">
                  Best-fit role resolved from your domain answers
                  {report.role.coCandidate ? `, with ${ROLE_LABELS[report.role.coCandidate]} as a close second.` : "."}
                </p>
              </div>
            )}
            {report.nextSteps.abroad && (
              <div className="rounded-[14px] p-4 border border-line bg-[#fbfaff]/60 shadow-sm space-y-2 sm:col-span-2">
                <div className="text-[10px] font-bold text-ink-400 font-mono uppercase">Mobility &amp; Values</div>
                <p className="text-[12px] text-ink-600 leading-relaxed italic">&ldquo;{report.nextSteps.abroad}&rdquo;</p>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      {/* PAGE 2: Future Plans */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
      >
        <PageTag n={2} />

        {isFull && report.cards ? (
          <>
            <section className="py-6 space-y-6">
              <SectionHeader icon={Award}>BEST PATH MATCHES FOR YOU</SectionHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                {report.cards.slice(0, 2).map((c, i) => (
                  <MatchCardBig key={c.career} card={c} index={i} />
                ))}
              </div>
            </section>

            {report.cards.length > 2 && (
              <section className="py-6 border-t border-line/50 space-y-6">
                <SectionHeader icon={Globe}>ALTERNATIVE PATHWAYS</SectionHeader>
                <div className="grid sm:grid-cols-2 gap-4">
                  {report.cards.slice(2, 4).map((c) => (
                    <MatchCardSmall key={c.career} card={c} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="py-10 space-y-6">
            <SectionHeader icon={Sparkles}>WHAT HAPPENS NEXT</SectionHeader>
            <div className="rounded-[18px] p-6 sm:p-8 border border-line bg-[#f8f7fd]/40 max-w-2xl">
              <p className="text-[14.5px] leading-relaxed text-ink-600">
                No percentages today — they wouldn&apos;t be honest. The fastest way forward is below.
              </p>
            </div>
          </section>
        )}
      </motion.div>

      {/* PAGE 3: NEXT Secure Step */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
      >
        <PageTag n={3} />

        {report.verdicts.length > 0 && (
          <section className="py-6 border-b border-line/50 space-y-4 mb-6">
            <SectionHeader icon={Lightbulb}>WE FEEL</SectionHeader>
            <div className="grid sm:grid-cols-3 gap-4">
              {report.verdicts.slice(0, 3).map((v) => (
                <div key={v.id} className="rounded-[14px] p-4 border border-line/50 bg-[#fbfaff]/60 space-y-2">
                  <Quote className="size-4 text-[#6e6ef0]/40" />
                  <p className="text-[12.5px] text-ink-600 leading-relaxed italic">{v.line}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-10 py-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#e8f8ef] flex items-center justify-center text-green-600">
                <Leaf className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">GROWTH TIPS FOR YOU</h2>
            </div>
            <div className="space-y-4">
              {report.growthTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-ink-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#eef3fe] flex items-center justify-center text-blue-600">
                <Send className="size-3" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">YOUR NEXT STEPS</h2>
            </div>
            <div className="space-y-4">
              {[report.nextSteps.counselling, report.nextSteps.exposure, report.nextSteps.conversation].map((step, idx) => (
                <div key={idx} className="flex gap-3.5 items-start">
                  <span className="size-5 rounded-full bg-blue-600 text-white font-mono text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[13.5px] text-ink-600 font-medium leading-relaxed">{step}</p>
                </div>
              ))}
              {report.nextSteps.abroad && (
                <div className="flex gap-3.5 items-start rounded-xl border border-[#6e6ef0]/20 bg-[#f3f0fc]/60 p-3">
                  <span className="size-5 rounded-full bg-[#6e6ef0] text-white font-mono text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <p className="text-[13.5px] text-ink-700 font-medium leading-relaxed">{report.nextSteps.abroad}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-6 border-t border-line/50 flex flex-col items-center text-center space-y-2">
          <Quote className="size-6 text-[#6e6ef0]/30 transform rotate-180" />
          <p className="text-[15px] sm:text-[16px] font-extrabold italic text-ink-600 leading-relaxed max-w-lg">
            You don&apos;t need to have it all figured out. You just need the right direction.
          </p>
        </section>

        <footer className="pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Logo className="size-5 text-[#6e6ef0]" />
            <span className="font-bold text-[13px] font-sans text-ink-400">SecureSteps</span>
          </div>
          <p className="text-[11.5px] text-ink-400 leading-relaxed text-center sm:text-right max-w-md">
            This report reflects what your answers showed about approach and preference. It does not measure
            ability, and no single question decided any line above. · Secure Steps
          </p>
        </footer>
      </motion.div>
    </article>
  );
}
