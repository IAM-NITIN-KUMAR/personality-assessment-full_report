"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  CareerTraitGroup,
  EnvFit,
  EnvironmentFit,
  PreferenceLevel,
  ReportData,
  Stat,
  WorkAptitude,
  WorkPreference,
} from "@/lib/report-data";
import { DIMENSION_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RadarChart, EngagementDial, type RadarAxis } from "./report-visuals";

const SECTION_ORDER: Array<{ id: Stat["section"]; label: string; eyebrow: string; index: string }> = [
  { id: "self",   index: "01", label: "Self",          eyebrow: "WHO YOU ARE · ROOTS LAYER" },
  { id: "fit",    index: "02", label: "Fit",           eyebrow: "WHERE IT FITS · ROUTES LAYER" },
  { id: "honest", index: "03", label: "Honest signal", eyebrow: "ENGAGEMENT · REALITY CHECK" },
  { id: "plan",   index: "04", label: "Plan",          eyebrow: "WHAT TO DO NEXT" },
];

export function ReportView({ data }: { data: ReportData }) {
  return (
    <article className="max-w-5xl mx-auto px-6 pb-32">
      <Cover data={data} />
      <FutureDaySection data={data} />
      <DriversSection drivers={data.drivers} />
      <DimensionGrid data={data} />
      {SECTION_ORDER.map((section) => (
        <StatSection
          key={section.id}
          section={section}
          stats={data.stats.filter((s) => s.section === section.id)}
          honestExtras={section.id === "honest" ? data.engagement : undefined}
        />
      ))}
      <NicheTable data={data} />
      <DegreeRecommendationsSection
        title="Routes Worth Walking"
        eyebrow="BEST-FIT COURSES"
        items={data.topDegrees}
        emphasis
      />
      <DegreeRecommendationsSection
        title="Branches Worth Knowing"
        eyebrow="ROUTES JUST OFF THE MAIN PATH"
        items={data.alternativeDegrees}
      />
      <CommunityInsightsSection data={data} />
      <WorkPreferencesSection prefs={data.workPreferences} />
      <WorkAptitudesSection aptitudes={data.workAptitudes} />
      <EnvironmentFitSection items={data.environmentFit} />
      <CareerTraitsSection groups={data.careerTraits} />
      <ContextCard data={data} />
      <ParentLetterSection data={data} />
      <Closer />
    </article>
  );
}

function Cover({ data }: { data: ReportData }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-12 pb-12 border-b border-line"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="active-dot" />
        <span className="mono-eyebrow text-electric">PERSONAL REPORT · GENERATED</span>
        <span className="mono-eyebrow text-ink-300">· {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        {data.profile.photo && (
          <img
            src={data.profile.photo}
            alt={data.profile.name}
            className="size-14 rounded-full object-cover ring-2 ring-electric/30"
            draggable={false}
          />
        )}
        <div className="mono-eyebrow text-ink-400">{data.profile.name.toUpperCase()} · {data.profile.discipline.toUpperCase()}</div>
      </div>
      <h1 className="display-xl text-[64px] md:text-[88px] text-ink leading-[0.95]">
        {data.archetype.name.replace(/^The\s/, "").toUpperCase()}
      </h1>
      <p className="display-md text-[20px] md:text-[24px] text-ink-500 mt-4">{data.archetype.tagline}</p>
      <div className="grid md:grid-cols-[1fr,auto] gap-10 mt-8 items-start">
        <div>
          <p className="text-[16px] text-ink-500 leading-relaxed max-w-2xl">{data.archetype.description}</p>
          {data.coreThemes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {data.coreThemes.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-electric-tint text-electric font-mono text-[11px] uppercase tracking-[0.12em] font-semibold border border-electric/20"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <MatchScoreDisk score={data.matchScore} />
      </div>

      <div className="flex items-center gap-8 mt-10 flex-wrap">
        <CoverStat label="MEASUREMENTS" value={`${data.measurementCount}`} />
        <CoverStat label="DIMENSIONS"   value={`${data.rootsReadout.length}`} />
        <CoverStat label="CAREER TRAITS" value={`${data.careerTraits.reduce((a, g) => a + g.traits.length, 0)}`} />
        <CoverStat label="ROLE CLUSTERS" value={`${data.routesClusters.length}`} />
        <CoverStat label="NICHE FIELDS"  value={`${data.niches.length}`} />
      </div>
    </motion.section>
  );
}

function MatchScoreDisk({ score }: { score: number }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const circumference = 2 * Math.PI * r;
  const fillFraction = Math.max(0, Math.min(1, score / 100));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#FA7BD6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - fillFraction) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.18em] text-ink-300">MATCH</div>
        <div className="display-xl text-[44px] text-ink leading-none mt-0.5">{score}</div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-ink-400">%</div>
      </div>
    </div>
  );
}

function CoverStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-eyebrow text-ink-300">{label}</div>
      <div className="font-mono text-[20px] font-semibold tracking-tight text-ink mt-1">{value}</div>
    </div>
  );
}

function DimensionGrid({ data }: { data: ReportData }) {
  // Build the radar axes from the 6 dimension scores. Convert -100..+100 → 0..100.
  const axes: RadarAxis[] = data.rootsReadout.map((r) => ({
    key: r.dimension,
    label: DIMENSION_LABELS[r.dimension].label,
    value: Math.round(50 + r.value / 2),
  }));

  return (
    <section className="mt-14">
      <div className="mono-eyebrow text-ink-300 mb-6">DIMENSIONAL READING · 6 AXES</div>
      <div className="grid md:grid-cols-[minmax(280px,1fr),1.4fr] gap-8 items-center mb-6">
        <div className="flex justify-center">
          <RadarChart axes={axes} size={320} />
        </div>
        <div className="text-[14px] text-ink-500 leading-relaxed max-w-md">
          <div className="mono-eyebrow text-ink-300 mb-2">YOUR PROFILE</div>
          <p>
            Each axis is one core dimension of how you operate. Where the polygon
            stretches outward, you lean into that pole; where it pulls in, you lean
            into the opposite. Most people aren't symmetric — and that asymmetry
            is the actual signal.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {data.rootsReadout.map((r) => {
          const meta = DIMENSION_LABELS[r.dimension];
          const pole = r.value >= 0 ? meta.high : meta.low;
          return (
            <div key={r.dimension} className="panel-subtle p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="mono-eyebrow text-ink-300">{meta.label.toUpperCase()}</div>
                <span className="font-mono text-[12px] text-ink-400">
                  {r.value > 0 ? "+" : ""}{r.value}
                </span>
              </div>
              <div className="display-md text-[18px] text-ink mb-2">{pole}</div>
              <div className="h-1 w-full bg-line rounded-full overflow-hidden mb-3">
                <div className="h-full bg-electric" style={{ width: `${Math.min(100, Math.abs(r.value))}%` }} />
              </div>
              <p className="text-[13px] text-ink-500 leading-relaxed">{r.sentence}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatSection({
  section,
  stats,
  honestExtras,
}: {
  section: typeof SECTION_ORDER[number];
  stats: Stat[];
  honestExtras?: ReportData["engagement"];
}) {
  if (!stats.length) return null;
  return (
    <section className="mt-20">
      <header className="mb-8 flex items-end gap-5">
        <span className="display-xl text-[56px] md:text-[72px] text-ink-200 leading-none tracking-tight">
          {section.index}
        </span>
        <div className="pb-1">
          <div className="mono-eyebrow text-ink-300 mb-1.5">{section.eyebrow}</div>
          <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-none">{section.label}</h2>
        </div>
      </header>

      {honestExtras && (
        <div className="panel p-7 mb-4 grid md:grid-cols-[200px,1fr] gap-7 items-center">
          <div className="flex justify-center">
            <EngagementDial score={honestExtras.score} level={honestExtras.level} size={200} />
          </div>
          <div>
            <div className="mono-eyebrow text-ink-300 mb-2">FIELD ENGAGEMENT · LIVED VS STATED</div>
            <h3 className="display-md text-[24px] text-ink leading-tight mb-3">
              {honestExtras.level}
            </h3>
            <p className="text-[14px] text-ink-500 leading-relaxed">{honestExtras.message}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.filter((s) => !(honestExtras && s.key === "engagement")).map((s) => (
          <StatCard key={s.key} stat={s} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const toneRing = {
    positive: "ring-1 ring-positive/30",
    warning: "ring-1 ring-warning/30",
    neutral: "",
  }[stat.tone ?? "neutral"];
  const toneTag = {
    positive: "text-positive",
    warning: "text-warning",
    neutral: "text-ink-400",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("panel p-5 flex flex-col h-full", toneRing)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("mono-eyebrow", toneTag)}>{stat.label}</div>
        {stat.score !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-line overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  stat.tone === "warning" ? "bg-warning" : stat.tone === "positive" ? "bg-positive" : "bg-electric",
                )}
                style={{ width: `${Math.max(0, Math.min(100, stat.score))}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-ink-400 w-7 text-right">{Math.round(stat.score)}</span>
          </div>
        )}
      </div>
      <div className="display-md text-[20px] text-ink mb-2 text-balance">{stat.value}</div>
      <p className="text-[13px] text-ink-500 leading-relaxed flex-1">{stat.detail}</p>
    </div>
  );
}

function NicheTable({ data }: { data: ReportData }) {
  if (!data.niches.length) return null;
  return (
    <section className="mt-20">
      <div className="mono-eyebrow text-ink-300 mb-6">NICHE FIELDS · RANKED FIT</div>
      <div className="panel divide-y divide-line">
        {data.niches.map((n, i) => (
          <div key={n.tag} className="flex items-center gap-4 px-5 py-4">
            <div className="font-mono text-[12px] text-ink-300 w-6">{String(i + 1).padStart(2, "0")}</div>
            <div className="flex-1">
              <div className="mono-eyebrow text-ink-300">{n.tag}</div>
              <div className="display-md text-[16px] text-ink mt-0.5">{n.name}</div>
              <p className="text-[13px] text-ink-500 mt-1">{n.why}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-electric" style={{ width: `${n.fit}%` }} />
              </div>
              <span className="font-mono text-[12px] text-ink-400 w-8 text-right">{n.fit}</span>
            </div>
            <ChevronRight className="size-4 text-ink-300" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── New PRISM-equivalent sections ────────────────────────────────────────

const PREF_TIER_INDEX: Record<PreferenceLevel, number> = {
  Avoided: 0, Weak: 1, Moderate: 2, Strong: 3, "Very Strong": 4,
};

function WorkPreferencesSection({ prefs }: { prefs: WorkPreference[] }) {
  return (
    <section className="mt-20">
      <header className="mb-8 flex items-end gap-5">
        <span className="display-xl text-[56px] md:text-[72px] text-ink-200 leading-none tracking-tight">05</span>
        <div className="pb-1">
          <div className="mono-eyebrow text-ink-300 mb-1.5">PREFERENCES · {prefs.length} ITEMS</div>
          <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-none">Work Preferences</h2>
        </div>
      </header>
      <p className="text-[15px] text-ink-500 max-w-3xl mb-7">
        How comfortable you are using each behaviour, instinctively. Far-right means it's a strength
        you reach for unprompted; far-left means you tend to avoid it. Neither is good or bad — context decides.
      </p>
      <div className="panel divide-y divide-line">
        {prefs.map((p) => (
          <div key={p.key} className="px-5 py-4 grid md:grid-cols-[1fr,260px] gap-x-6 gap-y-2 items-center">
            <div>
              <div className="display-md text-[16px] text-ink">{p.label}</div>
              <p className="text-[13px] text-ink-500 mt-0.5 leading-relaxed">{p.detail}</p>
            </div>
            <PreferenceTierBar level={p.level} score={p.score} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PreferenceTierBar({ level, score }: { level: PreferenceLevel; score: number }) {
  const tiers: PreferenceLevel[] = ["Avoided", "Weak", "Moderate", "Strong", "Very Strong"];
  const activeIdx = PREF_TIER_INDEX[level];
  return (
    <div className="md:justify-self-end w-full">
      <div className="grid grid-cols-5 gap-1">
        {tiers.map((t, i) => (
          <div
            key={t}
            className={cn(
              "h-1.5 rounded-full",
              i <= activeIdx ? "bg-electric" : "bg-line",
            )}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[10px] text-ink-300 uppercase tracking-wider">
          {level}
        </span>
        <span className="font-mono text-[10px] text-ink-400">{score}/100</span>
      </div>
    </div>
  );
}

function WorkAptitudesSection({ aptitudes }: { aptitudes: WorkAptitude[] }) {
  // Short labels for the radar — full ones are too long.
  const RADAR_LABELS: Record<string, string> = {
    practical_mechanical: "Practical",
    investigative_analytical: "Analytical",
    creative_artistic: "Creative",
    social_empathetic: "Social",
    competitive_entrepreneurial: "Competitive",
    orderly_efficient: "Orderly",
    mathematical_logical: "Mathematical",
    outgoing_expressive: "Outgoing",
  };
  const axes: RadarAxis[] = aptitudes.map((a) => ({
    key: a.key,
    label: RADAR_LABELS[a.key] ?? a.label,
    value: a.score,
  }));

  return (
    <section className="mt-20">
      <header className="mb-8 flex items-end gap-5">
        <span className="display-xl text-[56px] md:text-[72px] text-ink-200 leading-none tracking-tight">06</span>
        <div className="pb-1">
          <div className="mono-eyebrow text-ink-300 mb-1.5">APTITUDES · 0–100 SCALE</div>
          <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-none">Work Aptitudes</h2>
        </div>
      </header>
      <p className="text-[15px] text-ink-500 max-w-3xl mb-7">
        Natural talents — the kinds of work you'd find easiest to enjoy and learn fast. Doesn't mean
        you can't do the others; just that the friction is lower here.
      </p>
      <div className="grid md:grid-cols-[minmax(280px,1fr),1.4fr] gap-8 items-center mb-8">
        <div className="flex justify-center">
          <RadarChart axes={axes} size={300} />
        </div>
        <div className="text-[14px] text-ink-500 leading-relaxed max-w-md">
          <div className="mono-eyebrow text-ink-300 mb-2">APTITUDE PROFILE</div>
          <p>
            Eight directions you could lean. The further the polygon reaches in
            any one direction, the lower the friction in that flavor of work.
            A balanced profile means flexibility; a peaked one means you should
            optimize for that peak rather than fight it.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {aptitudes.map((a) => (
          <AptitudeCard key={a.key} aptitude={a} />
        ))}
      </div>
    </section>
  );
}

function AptitudeCard({ aptitude }: { aptitude: WorkAptitude }) {
  const strong = aptitude.score >= 70;
  const weak = aptitude.score < 35;
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="display-md text-[16px] text-ink">{aptitude.label}</div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-[12px] text-ink-400 w-8 text-right">{aptitude.score}</div>
          <div className="mono-eyebrow text-ink-300">/100</div>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-line overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full",
            strong ? "bg-electric" : weak ? "bg-ink-200" : "bg-ink-400",
          )}
          style={{ width: `${aptitude.score}%` }}
        />
      </div>
      <p className="text-[13px] text-ink-500 leading-relaxed">{aptitude.detail}</p>
    </div>
  );
}

const FIT_STYLES: Record<EnvFit, { label: string; bar: string; ring: string; text: string }> = {
  Enhanced:  { label: "ENHANCED",  bar: "bg-electric",       ring: "ring-electric/40", text: "text-electric" },
  Neutral:   { label: "NEUTRAL",   bar: "bg-ink-300",         ring: "ring-line",        text: "text-ink-400" },
  Inhibited: { label: "INHIBITED", bar: "bg-warning",         ring: "ring-warning/40",  text: "text-warning" },
};

function EnvironmentFitSection({ items }: { items: EnvironmentFit[] }) {
  return (
    <section className="mt-20">
      <header className="mb-8 flex items-end gap-5">
        <span className="display-xl text-[56px] md:text-[72px] text-ink-200 leading-none tracking-tight">07</span>
        <div className="pb-1">
          <div className="mono-eyebrow text-ink-300 mb-1.5">ENVIRONMENT · {items.length} PREDICTIONS</div>
          <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-none">Where You'll Thrive</h2>
        </div>
      </header>
      <p className="text-[15px] text-ink-500 max-w-3xl mb-7">
        How various work environments are likely to affect your performance. Use these to pick contexts
        that pull more out of you, and to budget effort against the ones that don't.
      </p>
      <div className="panel divide-y divide-line">
        {items.map((it) => {
          const styles = FIT_STYLES[it.fit];
          return (
            <div key={it.key} className="px-5 py-4 flex items-start gap-5">
              <div className="flex-1 text-[14px] text-ink/85 leading-relaxed">
                {it.description}
              </div>
              <div className={cn("shrink-0 mono-eyebrow font-bold", styles.text)}>
                {styles.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CareerTraitsSection({ groups }: { groups: CareerTraitGroup[] }) {
  return (
    <section className="mt-20">
      <header className="mb-8 flex items-end gap-5">
        <span className="display-xl text-[56px] md:text-[72px] text-ink-200 leading-none tracking-tight">08</span>
        <div className="pb-1">
          <div className="mono-eyebrow text-ink-300 mb-1.5">DEEP DIVE · {groups.reduce((a, g) => a + g.traits.length, 0)} TRAITS</div>
          <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-none">Career Development Analysis</h2>
        </div>
      </header>
      <p className="text-[15px] text-ink-500 max-w-3xl mb-7">
        A finer-grained map. Each trait is a continuum — your pointer shows where you sit. Both poles
        are useful; the score tells you the side you'll naturally reach for.
      </p>
      <div className="space-y-10">
        {groups.map((g) => (
          <div key={g.category}>
            <div className="mono-eyebrow text-electric mb-3">{g.category.toUpperCase()}</div>
            <div className="panel divide-y divide-line">
              {g.traits.map((t) => (
                <div key={t.key} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="display-md text-[15px] text-ink">{t.label}</div>
                    <div className="font-mono text-[11px] text-ink-400">{t.score}/100</div>
                  </div>
                  <div className="grid md:grid-cols-[minmax(160px,1fr),2fr,minmax(160px,1fr)] gap-x-4 items-center">
                    <div className="text-[12px] text-ink-400 leading-snug hidden md:block">
                      {t.lowLabel}
                    </div>
                    <div className="relative">
                      <div className="h-1 w-full bg-line rounded-full" />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-electric ring-4 ring-electric-tint"
                        style={{ left: `calc(${t.score}% - 6px)` }}
                      />
                    </div>
                    <div className="text-[12px] text-ink-400 leading-snug text-right hidden md:block">
                      {t.highLabel}
                    </div>
                  </div>
                  <div className="md:hidden mt-2 grid gap-1 text-[11px] text-ink-400">
                    <div><span className="mono-eyebrow text-ink-300">LOW</span> {t.lowLabel}</div>
                    <div><span className="mono-eyebrow text-ink-300">HIGH</span> {t.highLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContextCard({ data }: { data: ReportData }) {
  return (
    <section className="mt-20">
      <div className="mono-eyebrow text-ink-300 mb-6">CONTEXT · WHAT YOU TOLD US</div>
      <div className="panel p-7 grid md:grid-cols-2 gap-x-10 gap-y-5">
        <Field label="BUDGET"   value={data.context.budget} />
        <Field label="WHERE"    value={data.context.geographies.join(" · ").toUpperCase() || "—"} />
        <Field label="FAMILY"   value={data.context.family} />
        <Field label="AMBITION" value={data.context.tier} />
        <Field label="TIMELINE" value={data.context.timeline} />
        {data.context.dream && (
          <div className="md:col-span-2 mt-2">
            <div className="mono-eyebrow text-ink-300 mb-2">FIVE YEARS FROM NOW</div>
            <p className="text-[18px] text-ink leading-relaxed text-balance">"{data.context.dream}"</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-eyebrow text-ink-300 mb-1">{label}</div>
      <div className="text-[15px] text-ink">{value}</div>
    </div>
  );
}

function Closer() {
  return (
    <div className="text-center mt-24 pt-10 border-t border-line">
      <div className="display-md text-[28px] text-ink mb-3">
        Roots define you. <span className="text-ink-300">Routes are yours to choose.</span>
      </div>
      <div className="mono-eyebrow text-ink-300 mt-6">ROOTS / ROUTES · SECURE STEPS</div>
    </div>
  );
}

// ── New Appli-inspired narrative sections ─────────────────────────────────

function FutureDaySection({ data }: { data: ReportData }) {
  return (
    <section className="mt-20 grid md:grid-cols-[1.4fr,1fr] gap-10 items-start">
      <div>
        <div className="mono-eyebrow text-electric mb-3">WHERE THE ROUTES LEAD</div>
        <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-tight mb-5">Five Years From Today</h2>
        <p className="text-[16px] text-ink/85 leading-[1.7] text-balance">{data.futureDay.narrative}</p>
      </div>
      <div className="panel p-6 self-stretch flex flex-col justify-center">
        <div className="mono-eyebrow text-ink-300 mb-3">WORDS THAT FIT</div>
        <blockquote className="display-md text-[20px] italic text-ink leading-snug text-balance">
          &ldquo;{data.archetypeQuote.text}&rdquo;
        </blockquote>
        <div className="mono-eyebrow text-electric mt-4">— {data.archetypeQuote.attribution.toUpperCase()}</div>
      </div>
    </section>
  );
}

function DriversSection({ drivers }: { drivers: ReportData["drivers"] }) {
  return (
    <section className="mt-20">
      <header className="mb-8">
        <div className="mono-eyebrow text-electric mb-3">FORCES AT PLAY</div>
        <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-tight">What's Underneath</h2>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {drivers.map((d, i) => (
          <div key={d.key} className="panel p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] text-ink-300">0{i + 1}</span>
              <span className="active-dot" />
              <span className="mono-eyebrow text-electric">{d.category}</span>
            </div>
            <div className="display-md text-[19px] text-ink mb-2 leading-tight">{d.label}</div>
            <p className="text-[13px] text-ink-500 leading-relaxed">{d.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DegreeRecommendationsSection({
  items,
  title,
  eyebrow,
  emphasis,
}: {
  items: ReportData["topDegrees"];
  title: string;
  eyebrow: string;
  emphasis?: boolean;
}) {
  if (!items.length || (items.length === 1 && items[0].match === 0)) return null;
  return (
    <section className="mt-20">
      <header className="mb-6">
        <div className="mono-eyebrow text-electric mb-3">{eyebrow}</div>
        <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-tight">{title}</h2>
      </header>
      <div className={cn("grid gap-4", emphasis ? "md:grid-cols-1" : "md:grid-cols-3")}>
        {items.map((d, i) => (
          <div
            key={d.title}
            className={cn(
              "panel p-6 relative",
              emphasis && "p-7 md:p-8",
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="mono-eyebrow text-ink-300 mb-2">OPTION {String(i + 1).padStart(2, "0")}</div>
                <div className={cn("display-md text-ink leading-tight", emphasis ? "text-[20px] md:text-[22px]" : "text-[15px]")}>
                  {d.title}
                </div>
              </div>
              <MatchBadge match={d.match} />
            </div>
            <p className={cn("text-ink-500 leading-relaxed", emphasis ? "text-[14px]" : "text-[13px]")}>
              {d.why}
            </p>
            <div className="mt-4 panel-subtle p-4 border-l-2 border-electric">
              <div className="mono-eyebrow text-electric mb-1">FIELD READ</div>
              <p className={cn("text-ink/85 leading-relaxed", emphasis ? "text-[13px]" : "text-[12px]")}>{d.insight}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchBadge({ match }: { match: number }) {
  return (
    <div className="text-right shrink-0">
      <div className="font-mono text-[10px] tracking-[0.18em] text-ink-300">MATCH</div>
      <div className="display-md text-[24px] text-electric leading-none mt-1">{match}<span className="text-[14px] text-ink-300">%</span></div>
    </div>
  );
}

function CommunityInsightsSection({ data }: { data: ReportData }) {
  if (!data.commonCareerPaths.length && !data.sharedInterests.length) return null;
  return (
    <section className="mt-20">
      <header className="mb-6">
        <div className="mono-eyebrow text-electric mb-3">OTHERS ON YOUR ROUTE</div>
        <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-tight">
          Where students like you have landed
        </h2>
      </header>
      <div className="grid md:grid-cols-2 gap-4">
        {data.commonCareerPaths.length > 0 && (
          <div className="panel p-6">
            <div className="mono-eyebrow text-ink-300 mb-4">FIVE-YEAR LANDING SPOTS · {data.archetype.name.toUpperCase()}</div>
            <div className="space-y-3">
              {data.commonCareerPaths.map((p) => (
                <div key={p.role}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] text-ink">{p.role}</span>
                    <span className="font-mono text-[12px] text-ink-400">{p.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-electric" style={{ width: `${p.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.sharedInterests.length > 0 && (
          <div className="panel p-6">
            <div className="mono-eyebrow text-ink-300 mb-4">PURSUITS OFF THE SYLLABUS</div>
            <div className="flex flex-wrap gap-2">
              {data.sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-full bg-surface-subtle border border-line text-[13px] text-ink"
                >
                  {interest}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-ink-400 mt-5 leading-relaxed">
              What students of your type tend to spend their own time on — not what's required, what's chosen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ParentLetterSection({ data }: { data: ReportData }) {
  return (
    <section className="mt-24">
      <div className="mono-eyebrow text-electric mb-3">PASS THIS TO THE PEOPLE WHO ASK</div>
      <h2 className="display-md text-[28px] md:text-[32px] text-ink leading-tight mb-6">A short note for your family</h2>
      <div className="panel p-8 md:p-10">
        <p className="display-md text-[18px] text-ink mb-5">{data.parentLetter.greeting}</p>
        <div className="space-y-5">
          {data.parentLetter.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] text-ink/85 leading-[1.75] text-balance">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-7 pt-6 border-t border-line whitespace-pre-line text-[14px] text-ink-500">
          {data.parentLetter.signoff}
        </div>
      </div>
    </section>
  );
}
