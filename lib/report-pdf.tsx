"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Polygon,
  Polyline,
  Circle,
  Line,
  Path,
  G,
} from "@react-pdf/renderer";
import { ReportData, Stat } from "./report-data";
import { DIMENSION_LABELS } from "./types";

// PDF built-in fonts — guaranteed available, no fetch.
const SERIF_BOLD = "Times-Bold";
const SERIF_ITALIC = "Times-Italic";
const SANS = "Helvetica";
const SANS_BOLD = "Helvetica-Bold";
const SANS_OBL = "Helvetica-Oblique";
const MONO = "Courier";
const MONO_BOLD = "Courier-Bold";

const COLORS = {
  white: "#FFFFFF",
  page: "#FFFFFF",
  panel: "#F4F4F6",
  ink: "#0A0E1A",
  inkSoft: "#3A3D48",
  inkMuted: "#6B6F78",
  inkFaint: "#9CA0A8",
  line: "#E5E7EB",
  electric: "#F3A6D9",
  electricTint: "#FDEEF8",
  positive: "#16A34A",
  warning: "#E76F51",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.page,
    color: COLORS.ink,
    fontFamily: SANS,
    fontSize: 10,
    paddingHorizontal: 50,
    paddingTop: 56,
    paddingBottom: 70,
    lineHeight: 1.45,
  },
  monoEyebrow: {
    fontFamily: MONO_BOLD,
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.inkMuted,
  },
  monoLabel: {
    fontFamily: MONO,
    fontSize: 9,
    color: COLORS.inkMuted,
  },
  body: {
    fontSize: 10,
    color: COLORS.inkSoft,
    lineHeight: 1.55,
  },
  bodyLight: {
    fontSize: 9,
    color: COLORS.inkMuted,
    lineHeight: 1.5,
  },
  h1: {
    fontFamily: SANS_BOLD,
    fontSize: 56,
    letterSpacing: -1.5,
    lineHeight: 0.95,
  },
  h2: {
    fontFamily: SANS_BOLD,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 1.1,
  },
  h3: {
    fontFamily: SANS_BOLD,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  h4: {
    fontFamily: SANS_BOLD,
    fontSize: 11,
  },
  pageHeader: {
    position: "absolute",
    top: 24,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  panel: {
    borderWidth: 0.7,
    borderColor: COLORS.line,
    borderRadius: 10,
    padding: 14,
    backgroundColor: COLORS.white,
  },
  panelSubtle: {
    borderWidth: 0.7,
    borderColor: COLORS.line,
    borderRadius: 10,
    padding: 14,
    backgroundColor: COLORS.panel,
  },
  meterTrack: {
    height: 3,
    backgroundColor: COLORS.line,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  electricDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.electric,
  },
});

export function ReportDocument({ data }: { data: ReportData }) {
  const sections: Array<{ id: Stat["section"]; index: string; eyebrow: string; title: string }> = [
    { id: "self",   index: "01", eyebrow: "WHO YOU ARE · ROOTS LAYER",   title: "Self" },
    { id: "fit",    index: "02", eyebrow: "WHERE IT FITS · ROUTES LAYER", title: "Fit" },
    { id: "honest", index: "03", eyebrow: "ENGAGEMENT · REALITY CHECK",   title: "Honest signal" },
    { id: "plan",   index: "04", eyebrow: "WHAT TO DO NEXT",              title: "Plan" },
  ];

  return (
    <Document
      title={`Roots & Routes — ${data.profile.name}`}
      author="Secure Steps"
      subject="Personality & career-fit assessment report"
    >
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={{ marginTop: 50 }}>
          {/* Match score disc, top-right corner */}
          <View style={{ position: "absolute", right: 0, top: 0 }}>
            <MatchDisc score={data.matchScore} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <View style={styles.electricDot} />
            <Text style={[styles.monoEyebrow, { color: COLORS.electric }]}>PERSONAL REPORT</Text>
            <Text style={styles.monoEyebrow}>· {today()}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
            {data.profile.photo && (
              <Image
                src={data.profile.photo}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                }}
              />
            )}
            <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD, color: COLORS.inkSoft }]}>
              {data.profile.name.toUpperCase()} · {data.profile.discipline.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.h1}>{data.archetype.name.replace(/^The\s/, "").toUpperCase()}</Text>

          <Text style={[{ fontFamily: SERIF_ITALIC, fontSize: 18, color: COLORS.inkSoft, marginTop: 18 }]}>
            {data.archetype.tagline}
          </Text>

          <Text style={[styles.body, { marginTop: 26, lineHeight: 1.65, maxWidth: 380 }]}>
            {data.archetype.description}
          </Text>

          {/* Core theme chips */}
          {data.coreThemes.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 22 }}>
              {data.coreThemes.map((t) => (
                <View
                  key={t}
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: COLORS.electricTint,
                    borderWidth: 0.6,
                    borderColor: COLORS.electric,
                  }}
                >
                  <Text style={[styles.monoEyebrow, { color: COLORS.electric, marginBottom: 0, fontSize: 7 }]}>
                    {t.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ marginTop: 40, flexDirection: "row", gap: 22 }}>
          <CoverStat label="MEASUREMENTS" value={`${data.measurementCount}`} />
          <CoverStat label="DIMENSIONS" value={`${data.rootsReadout.length}`} />
          <CoverStat label="CAREER TRAITS" value={`${data.careerTraits.reduce((a, g) => a + g.traits.length, 0)}`} />
          <CoverStat label="ROLES" value={`${data.routesClusters.length}`} />
          <CoverStat label="NICHES" value={`${data.niches.length}`} />
        </View>

        {/* Table of contents */}
        <View style={{ marginTop: 50 }}>
          <Text style={[styles.monoEyebrow, { marginBottom: 12 }]}>CONTENTS</Text>
          {sections.map((s) => (
            <View key={s.id} style={[styles.rowBetween, { paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: COLORS.line }]}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={[styles.monoLabel, { width: 22 }]}>{s.index}</Text>
                <Text style={[styles.body, { color: COLORS.ink, fontFamily: SANS_BOLD }]}>{s.title}</Text>
              </View>
              <Text style={[styles.monoEyebrow]}>{s.eyebrow}</Text>
            </View>
          ))}
          <View style={[styles.rowBetween, { paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: COLORS.line }]}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Text style={[styles.monoLabel, { width: 22 }]}>05</Text>
              <Text style={[styles.body, { color: COLORS.ink, fontFamily: SANS_BOLD }]}>Niches & Context</Text>
            </View>
            <Text style={styles.monoEyebrow}>SUB-FIELDS · WHAT YOU SAID</Text>
          </View>
        </View>

        <PageFooter pageLabel="COVER" sectionLabel={data.profile.name} />
      </Page>

      {/* Future Day + Quote */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <SectionTitle index="01" eyebrow="WHERE THE ROUTES LEAD" title="Five Years From Today" />
        <View style={{ marginTop: 14, flexDirection: "row", gap: 18 }}>
          <View style={{ flex: 1.4 }}>
            <Text style={[styles.body, { fontSize: 10.5, lineHeight: 1.75, color: COLORS.ink }]}>
              {data.futureDay.narrative}
            </Text>
          </View>
          <View style={[styles.panel, { flex: 1, padding: 16, justifyContent: "center" }]}>
            <Text style={[styles.monoEyebrow, { marginBottom: 8 }]}>WORDS THAT FIT</Text>
            <Text style={[{ fontFamily: SERIF_ITALIC, fontSize: 14, color: COLORS.ink, lineHeight: 1.5 }]}>
              &ldquo;{data.archetypeQuote.text}&rdquo;
            </Text>
            <Text style={[styles.monoEyebrow, { color: COLORS.electric, marginTop: 10 }]}>
              — {data.archetypeQuote.attribution.toUpperCase()}
            </Text>
          </View>
        </View>
        <PageFooter pageLabel="VISION BOARD" sectionLabel="FUTURE DAY · QUOTE" />
      </Page>

      {/* Drivers */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="02" eyebrow="FORCES AT PLAY" title="What's Underneath" />
        <View style={{ marginTop: 14 }}>
          {data.drivers.map((d, i) => (
            <View key={d.key} style={[styles.panel, { marginBottom: 7 }]} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Text style={[styles.monoLabel, { fontSize: 9, color: COLORS.inkMuted }]}>0{i + 1}</Text>
                <View style={{ width: 5, height: 5, backgroundColor: COLORS.electric }} />
                <Text style={[styles.monoEyebrow, { color: COLORS.electric }]}>{d.category}</Text>
              </View>
              <Text style={[styles.h3, { marginBottom: 4 }]}>{d.label}</Text>
              <Text style={styles.bodyLight}>{d.description}</Text>
            </View>
          ))}
        </View>
        <PageFooter pageLabel="DRIVERS" sectionLabel="FIVE FORCES" />
      </Page>

      {/* Dimensional reading page */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="00" eyebrow="DIMENSIONAL READING · 6 AXES" title="Dimensions" />
        <View style={{ marginTop: 14, alignItems: "center" }}>
          <PdfRadar
            axes={data.rootsReadout.map((r) => ({
              key: r.dimension,
              label: DIMENSION_LABELS[r.dimension].label,
              value: Math.round(50 + r.value / 2),
            }))}
            size={230}
          />
        </View>
        <View style={{ marginTop: 14 }}>
          {data.rootsReadout.map((r) => {
            const meta = DIMENSION_LABELS[r.dimension];
            const pole = r.value >= 0 ? meta.high : meta.low;
            return (
              <View key={r.dimension} style={[styles.panel, { marginBottom: 8 }]} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.monoEyebrow}>{meta.label.toUpperCase()}</Text>
                  <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD }]}>
                    {r.value > 0 ? "+" : ""}{r.value}
                  </Text>
                </View>
                <Text style={[styles.h3, { marginTop: 6, marginBottom: 8 }]}>{pole}</Text>
                <View style={[styles.meterTrack, { marginBottom: 8 }]}>
                  <View style={{ height: 3, backgroundColor: COLORS.electric, width: `${Math.min(100, Math.abs(r.value))}%` }} />
                </View>
                <Text style={styles.bodyLight}>{r.sentence}</Text>
              </View>
            );
          })}
        </View>
        <PageFooter pageLabel="DIMENSIONS" sectionLabel="ROOTS LAYER" />
      </Page>

      {/* Stat sections */}
      {sections.map((section) => {
        const sectionStats = data.stats.filter((s) => s.section === section.id);
        if (!sectionStats.length) return null;
        const isHonest = section.id === "honest" && data.engagement;
        const renderable = isHonest
          ? sectionStats.filter((s) => s.key !== "engagement")
          : sectionStats;
        return (
          <Page key={section.id} size="A4" style={styles.page} wrap>
            <PageHeader />
            <SectionTitle index={section.index} eyebrow={section.eyebrow} title={section.title} />
            {isHonest && data.engagement && (
              <View
                style={[
                  styles.panel,
                  {
                    marginTop: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingVertical: 14,
                  },
                ]}
                wrap={false}
              >
                <View style={{ width: 130 }}>
                  <PdfDial score={data.engagement.score} level={data.engagement.level} size={130} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.monoEyebrow, { marginBottom: 4 }]}>
                    FIELD ENGAGEMENT · LIVED VS STATED
                  </Text>
                  <Text style={styles.h3}>{data.engagement.level}</Text>
                  <Text style={[styles.bodyLight, { marginTop: 4 }]}>{data.engagement.message}</Text>
                </View>
              </View>
            )}
            <View style={{ marginTop: 12 }}>
              {renderable.map((s) => (
                <StatRow key={s.key} stat={s} />
              ))}
            </View>
            <PageFooter pageLabel={section.title.toUpperCase()} sectionLabel={section.eyebrow} />
          </Page>
        );
      })}

      {/* Niches table */}
      {data.niches.length > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <PageHeader />
          <SectionTitle index="05" eyebrow="NICHE FIELDS · RANKED FIT" title="Niches" />
          <View style={[styles.panel, { padding: 0, marginTop: 14 }]}>
            {data.niches.map((n, i) => (
              <View
                key={n.tag}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === data.niches.length - 1 ? 0 : 0.5,
                  borderBottomColor: COLORS.line,
                  gap: 10,
                }}
                wrap={false}
              >
                <Text style={[styles.monoLabel, { width: 18 }]}>{String(i + 1).padStart(2, "0")}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.monoEyebrow]}>{n.tag}</Text>
                  <Text style={[styles.h4, { marginTop: 2 }]}>{n.name}</Text>
                  <Text style={[styles.bodyLight, { marginTop: 3 }]}>{n.why}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={[styles.meterTrack, { width: 60 }]}>
                    <View style={{ height: 3, backgroundColor: COLORS.electric, width: `${n.fit}%` }} />
                  </View>
                  <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD, width: 18, textAlign: "right" }]}>{n.fit}</Text>
                </View>
              </View>
            ))}
          </View>
          <PageFooter pageLabel="NICHES" sectionLabel="SUB-FIELD FIT" />
        </Page>
      )}

      {/* Work Preferences */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="06" eyebrow={`PREFERENCES · ${data.workPreferences.length} ITEMS`} title="Work Preferences" />
        <Text style={[styles.body, { marginTop: 6, marginBottom: 10 }]}>
          How comfortable you are using each behaviour, instinctively. Far-right = a strength you reach for unprompted.
        </Text>
        {data.workPreferences.map((p) => (
          <View key={p.key} style={[styles.panel, { marginBottom: 6, paddingVertical: 10 }]} wrap={false}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.h4}>{p.label}</Text>
                <Text style={[styles.bodyLight, { marginTop: 3 }]}>{p.detail}</Text>
              </View>
              <PrefTierBar level={p.level} score={p.score} />
            </View>
          </View>
        ))}
        <PageFooter pageLabel="WORK PREFERENCES" sectionLabel="PRISM-EQUIVALENT" />
      </Page>

      {/* Work Aptitudes */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="07" eyebrow="APTITUDES · 0–100 SCALE" title="Work Aptitudes" />
        <Text style={[styles.body, { marginTop: 6, marginBottom: 10 }]}>
          Natural talents — the kinds of work you'd find easiest to enjoy and learn fast.
        </Text>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <PdfRadar
            axes={data.workAptitudes.map((a) => ({
              key: a.key,
              label: APTITUDE_SHORT_LABEL[a.key] ?? a.label,
              value: a.score,
            }))}
            size={210}
          />
        </View>
        {data.workAptitudes.map((a) => (
          <View key={a.key} style={[styles.panel, { marginBottom: 7 }]} wrap={false}>
            <View style={styles.rowBetween}>
              <Text style={styles.h4}>{a.label}</Text>
              <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD }]}>{a.score} / 100</Text>
            </View>
            <View style={[styles.meterTrack, { marginTop: 6, marginBottom: 6 }]}>
              <View
                style={{
                  height: 3,
                  backgroundColor: a.score >= 70 ? COLORS.electric : a.score < 35 ? COLORS.line : COLORS.inkMuted,
                  width: `${a.score}%`,
                }}
              />
            </View>
            <Text style={styles.bodyLight}>{a.detail}</Text>
          </View>
        ))}
        <PageFooter pageLabel="WORK APTITUDES" sectionLabel="0–100 SCORE" />
      </Page>

      {/* Environment Fit */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="08" eyebrow={`ENVIRONMENT · ${data.environmentFit.length} PREDICTIONS`} title="Where You'll Thrive" />
        <Text style={[styles.body, { marginTop: 6, marginBottom: 10 }]}>
          How various work environments are likely to affect your performance.
        </Text>
        <View style={[styles.panel, { padding: 0 }]}>
          {data.environmentFit.map((it, idx) => (
            <View
              key={it.key}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderBottomWidth: idx === data.environmentFit.length - 1 ? 0 : 0.5,
                borderBottomColor: COLORS.line,
                gap: 10,
              }}
              wrap={false}
            >
              <Text style={[styles.body, { flex: 1, fontSize: 9 }]}>{it.description}</Text>
              <Text
                style={[
                  styles.monoEyebrow,
                  {
                    width: 70,
                    textAlign: "right",
                    color:
                      it.fit === "Enhanced" ? COLORS.electric :
                      it.fit === "Inhibited" ? COLORS.warning : COLORS.inkMuted,
                  },
                ]}
              >
                {it.fit.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        <PageFooter pageLabel="ENVIRONMENT FIT" sectionLabel="ENHANCED · NEUTRAL · INHIBITED" />
      </Page>

      {/* Career Development Traits */}
      {data.careerTraits.map((g, gi) => (
        <Page key={g.category} size="A4" style={styles.page} wrap>
          <PageHeader />
          {gi === 0 && (
            <SectionTitle
              index="09"
              eyebrow={`DEEP DIVE · ${data.careerTraits.reduce((a, x) => a + x.traits.length, 0)} TRAITS`}
              title="Career Development Analysis"
            />
          )}
          <Text style={[styles.monoEyebrow, { color: COLORS.electric, marginTop: gi === 0 ? 12 : 4, marginBottom: 8 }]}>
            {g.category.toUpperCase()}
          </Text>
          {g.traits.map((t) => (
            <View key={t.key} style={[styles.panel, { marginBottom: 5, paddingVertical: 9 }]} wrap={false}>
              <View style={styles.rowBetween}>
                <Text style={styles.h4}>{t.label}</Text>
                <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD, fontSize: 9 }]}>{t.score} / 100</Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: 5, gap: 8, alignItems: "center" }}>
                <Text style={[styles.bodyLight, { flex: 1, fontSize: 8.5 }]}>{t.lowLabel}</Text>
                <View style={{ width: 90 }}>
                  <View style={[styles.meterTrack, { backgroundColor: COLORS.line }]}>
                    <View
                      style={{
                        position: "absolute",
                        left: `${Math.max(0, t.score - 1.5)}%`,
                        top: -2,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: COLORS.electric,
                      }}
                    />
                  </View>
                </View>
                <Text style={[styles.bodyLight, { flex: 1, fontSize: 8.5, textAlign: "right" }]}>{t.highLabel}</Text>
              </View>
            </View>
          ))}
          <PageFooter pageLabel={g.category.toUpperCase()} sectionLabel="CAREER DEVELOPMENT" />
        </Page>
      ))}

      {/* Context page */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <SectionTitle index="06" eyebrow="CONTEXT · WHAT YOU TOLD US" title="Context" />
        <View style={[styles.panel, { marginTop: 14 }]}>
          <ContextRow label="BUDGET"   value={data.context.budget} />
          <ContextRow label="WHERE"    value={data.context.geographies.join(" · ").toUpperCase() || "—"} />
          <ContextRow label="FAMILY"   value={data.context.family} />
          <ContextRow label="AMBITION" value={data.context.tier} />
          <ContextRow label="TIMELINE" value={data.context.timeline} last />
        </View>
        {data.context.dream && (
          <View style={[styles.panelSubtle, { marginTop: 10 }]}>
            <Text style={[styles.monoEyebrow, { marginBottom: 6 }]}>FIVE YEARS FROM NOW</Text>
            <Text style={[{ fontFamily: SERIF_ITALIC, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.55 }]}>
              "{data.context.dream}"
            </Text>
          </View>
        )}

        <PageFooter pageLabel="CONTEXT" sectionLabel="WHAT YOU TOLD US" />
      </Page>

      {/* Top Degree Recommendations */}
      {data.topDegrees.length > 0 && data.topDegrees[0].match > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <PageHeader />
          <SectionTitle index="10" eyebrow="BEST-FIT COURSES" title="Routes Worth Walking" />
          {data.topDegrees.map((d, i) => (
            <View key={d.title} style={[styles.panel, { marginTop: i === 0 ? 14 : 7, padding: 14 }]} wrap={false}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.monoEyebrow, { marginBottom: 4 }]}>OPTION {String(i + 1).padStart(2, "0")}</Text>
                  <Text style={styles.h3}>{d.title}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.monoEyebrow, { marginBottom: 1 }]}>MATCH</Text>
                  <Text style={{ fontFamily: SANS_BOLD, fontSize: 18, color: COLORS.electric }}>{d.match}%</Text>
                </View>
              </View>
              <Text style={[styles.bodyLight, { marginTop: 6 }]}>{d.why}</Text>
              <View
                style={{
                  marginTop: 8,
                  paddingLeft: 8,
                  paddingVertical: 6,
                  borderLeftWidth: 2,
                  borderLeftColor: COLORS.electric,
                  backgroundColor: COLORS.electricTint,
                }}
              >
                <Text style={[styles.monoEyebrow, { color: COLORS.electric, marginBottom: 2 }]}>FIELD READ</Text>
                <Text style={[styles.bodyLight, { fontSize: 9, color: COLORS.ink }]}>{d.insight}</Text>
              </View>
            </View>
          ))}
          <PageFooter pageLabel="TOP DEGREES" sectionLabel="RECOMMENDED PATHS" />
        </Page>
      )}

      {/* Alternative Pathways */}
      {data.alternativeDegrees.length > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <PageHeader />
          <SectionTitle index="11" eyebrow="ROUTES JUST OFF THE MAIN PATH" title="Branches Worth Knowing" />
          {data.alternativeDegrees.map((d) => (
            <View key={d.title} style={[styles.panel, { marginTop: 7, padding: 14 }]} wrap={false}>
              <View style={styles.rowBetween}>
                <Text style={[styles.h4, { flex: 1, paddingRight: 10 }]}>{d.title}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.monoEyebrow, { marginBottom: 1 }]}>MATCH</Text>
                  <Text style={{ fontFamily: SANS_BOLD, fontSize: 14, color: COLORS.electric }}>{d.match}%</Text>
                </View>
              </View>
              <Text style={[styles.bodyLight, { marginTop: 5 }]}>{d.why}</Text>
              <Text style={[styles.bodyLight, { marginTop: 6, fontStyle: "italic", color: COLORS.inkMuted, fontSize: 8.5 }]}>
                {d.insight}
              </Text>
            </View>
          ))}
          <PageFooter pageLabel="ALTERNATIVES" sectionLabel="ADJACENT PATHS" />
        </Page>
      )}

      {/* Community Insights */}
      {(data.commonCareerPaths.length > 0 || data.sharedInterests.length > 0) && (
        <Page size="A4" style={styles.page}>
          <PageHeader />
          <SectionTitle index="12" eyebrow="OTHERS ON YOUR ROUTE" title="Where Students Like You Have Landed" />
          <View style={{ marginTop: 14, gap: 8 }}>
            {data.commonCareerPaths.length > 0 && (
              <View style={[styles.panel, { padding: 14 }]}>
                <Text style={[styles.monoEyebrow, { marginBottom: 8 }]}>FIVE-YEAR LANDING SPOTS · {data.archetype.name.toUpperCase()}</Text>
                {data.commonCareerPaths.map((p) => (
                  <View key={p.role} style={{ marginBottom: 8 }}>
                    <View style={[styles.rowBetween, { marginBottom: 3 }]}>
                      <Text style={[styles.body, { color: COLORS.ink }]}>{p.role}</Text>
                      <Text style={[styles.monoLabel, { fontSize: 9 }]}>{p.percentage}%</Text>
                    </View>
                    <View style={[styles.meterTrack]}>
                      <View style={{ height: 3, backgroundColor: COLORS.electric, width: `${p.percentage}%` }} />
                    </View>
                  </View>
                ))}
              </View>
            )}
            {data.sharedInterests.length > 0 && (
              <View style={[styles.panel, { padding: 14 }]}>
                <Text style={[styles.monoEyebrow, { marginBottom: 8 }]}>PURSUITS OFF THE SYLLABUS</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
                  {data.sharedInterests.map((interest) => (
                    <View
                      key={interest}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: COLORS.panel,
                        borderWidth: 0.5,
                        borderColor: COLORS.line,
                      }}
                    >
                      <Text style={[styles.body, { fontSize: 9 }]}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
          <PageFooter pageLabel="COMMUNITY" sectionLabel="WHAT OTHERS DO" />
        </Page>
      )}

      {/* Letter to parents */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader />
        <SectionTitle index="13" eyebrow="PASS THIS TO THE PEOPLE WHO ASK" title="A Short Note for Your Family" />
        <View style={[styles.panel, { marginTop: 14, padding: 22 }]}>
          <Text style={[styles.h4, { marginBottom: 12 }]}>{data.parentLetter.greeting}</Text>
          {data.parentLetter.paragraphs.map((p, i) => (
            <Text
              key={i}
              style={[styles.body, { color: COLORS.ink, marginBottom: 9, lineHeight: 1.7 }]}
            >
              {p}
            </Text>
          ))}
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: COLORS.line }}>
            {data.parentLetter.signoff.split("\n").map((line, i) => (
              <Text key={i} style={[styles.body, { color: COLORS.inkMuted }]}>
                {line}
              </Text>
            ))}
          </View>
        </View>
        <PageFooter pageLabel="LETTER TO PARENTS" sectionLabel="FOR THE FAMILY" />
      </Page>

      {/* Thank you closer */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <View style={styles.electricDot} />
            <Text style={[styles.monoEyebrow, { color: COLORS.electric }]}>SESSION COMPLETE</Text>
          </View>
          <Text style={[styles.h1, { fontSize: 44, textAlign: "center" }]}>
            Thanks, {data.profile.name.split(" ")[0]}.
          </Text>
          <Text
            style={[
              styles.body,
              { textAlign: "center", marginTop: 18, color: COLORS.inkSoft, lineHeight: 1.65, maxWidth: 360 },
            ]}
          >
            Your answers are in. Your Secure Steps counsellor will reach out within 48 hours with your alumni match
            and the start of your college shortlist conversation.
          </Text>
          <View style={{ height: 30 }} />
          <Text style={[{ fontFamily: SERIF_ITALIC, fontSize: 18, color: COLORS.ink, textAlign: "center" }]}>
            Roots define you.
          </Text>
          <Text
            style={[
              { fontFamily: SERIF_ITALIC, fontSize: 18, color: COLORS.inkFaint, textAlign: "center", marginTop: 3 },
            ]}
          >
            Routes are yours to choose.
          </Text>
        </View>
        <PageFooter pageLabel="THANK YOU" sectionLabel="ROOTS / ROUTES · SECURE STEPS" />
      </Page>
    </Document>
  );
}

// ── Match disc on cover ────────────────────────────────────────────────────

function MatchDisc({ score }: { score: number }) {
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const circumference = 2 * Math.PI * r;
  const fillFraction = Math.max(0, Math.min(1, score / 100));
  const dashLen = circumference * fillFraction;
  const restLen = circumference - dashLen;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.line} strokeWidth={5} />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLORS.electric}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${dashLen.toFixed(1)} ${restLen.toFixed(1)}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <Text
          x={cx}
          y={cy - 4}
          style={{ fontFamily: MONO_BOLD, fontSize: 6, fill: COLORS.inkMuted }}
          textAnchor="middle"
        >
          MATCH
        </Text>
        <Text
          x={cx}
          y={cy + 11}
          style={{ fontFamily: SANS_BOLD, fontSize: 22, fill: COLORS.ink }}
          textAnchor="middle"
        >
          {score}%
        </Text>
      </Svg>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <View style={styles.pageHeader} fixed>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 9, height: 9, backgroundColor: COLORS.ink, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 3, height: 3, backgroundColor: COLORS.electric }} />
        </View>
        <Text style={[styles.monoEyebrow, { color: COLORS.ink }]}>ROOTS / ROUTES</Text>
      </View>
      <Text style={styles.monoEyebrow}>SECURE STEPS</Text>
    </View>
  );
}

function PageFooter({ pageLabel, sectionLabel }: { pageLabel: string; sectionLabel: string }) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.monoEyebrow}>{sectionLabel}</Text>
      <Text style={styles.monoEyebrow}>· {pageLabel} ·</Text>
    </View>
  );
}

function SectionTitle({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) {
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
        <Text style={[styles.h1, { fontSize: 48, color: COLORS.line }]}>{index}</Text>
        <View style={{ paddingBottom: 6 }}>
          <Text style={[styles.monoEyebrow, { marginBottom: 4 }]}>{eyebrow}</Text>
          <Text style={[styles.h2]}>{title}</Text>
        </View>
      </View>
    </View>
  );
}

function CoverStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.monoEyebrow}>{label}</Text>
      <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD, color: COLORS.ink, fontSize: 11, marginTop: 3 }]}>
        {value}
      </Text>
    </View>
  );
}

function StatRow({ stat }: { stat: Stat }) {
  const tone = stat.tone ?? "neutral";
  const accent = tone === "warning" ? COLORS.warning : tone === "positive" ? COLORS.positive : COLORS.electric;
  const ringColor = tone === "warning" ? COLORS.warning : tone === "positive" ? COLORS.positive : COLORS.line;
  return (
    <View
      style={[
        styles.panel,
        {
          marginBottom: 7,
          borderColor: ringColor,
          borderWidth: tone === "neutral" ? 0.7 : 0.9,
        },
      ]}
      wrap={false}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.monoEyebrow, { color: accent }]}>{stat.label}</Text>
        {stat.score !== undefined && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={[styles.meterTrack, { width: 50 }]}>
              <View style={{ height: 3, backgroundColor: accent, width: `${Math.max(0, Math.min(100, stat.score))}%` }} />
            </View>
            <Text style={[styles.monoLabel, { fontFamily: MONO_BOLD, fontSize: 8, width: 18, textAlign: "right" }]}>
              {Math.round(stat.score)}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.h4, { marginTop: 5, marginBottom: 4 }]}>{stat.value}</Text>
      <Text style={styles.bodyLight}>{stat.detail}</Text>
    </View>
  );
}

function ContextRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 9,
        borderBottomWidth: last ? 0 : 0.5,
        borderBottomColor: COLORS.line,
      }}
    >
      <Text style={[styles.monoEyebrow, { width: 80 }]}>{label}</Text>
      <Text style={[styles.body, { flex: 1, textAlign: "right", color: COLORS.ink }]}>{value}</Text>
    </View>
  );
}

function today(): string {
  return new Date()
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

// Short labels for the aptitude radar — full ones are too long inside the polygon.
const APTITUDE_SHORT_LABEL: Record<string, string> = {
  practical_mechanical: "Practical",
  investigative_analytical: "Analytical",
  creative_artistic: "Creative",
  social_empathetic: "Social",
  competitive_entrepreneurial: "Competitive",
  orderly_efficient: "Orderly",
  mathematical_logical: "Mathematical",
  outgoing_expressive: "Outgoing",
};

interface PdfRadarAxis { key: string; label: string; value: number }

function PdfRadar({ axes, size }: { axes: PdfRadarAxis[]; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const n = axes.length;
  const ringValues = [25, 50, 75, 100];

  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const point = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const p = point(i, axis.value);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Concentric rings */}
      {ringValues.map((rv, idx) => {
        const r = (rv / 100) * radius;
        const points = axes
          .map((_, i) => {
            const a = angleFor(i);
            return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
          })
          .join(" ");
        return (
          <Polygon
            key={rv}
            points={points}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={idx === ringValues.length - 1 ? 0.9 : 0.5}
          />
        );
      })}

      {/* Spokes */}
      {axes.map((_, i) => {
        const p = point(i, 100);
        return (
          <Line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={COLORS.line}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Filled polygon */}
      <Polygon
        points={polygonPoints}
        fill="rgba(243,166,217,0.22)"
        stroke={COLORS.electric}
        strokeWidth={1.6}
      />

      {/* Dots at vertices */}
      {axes.map((axis, i) => {
        const p = point(i, axis.value);
        return (
          <Circle
            key={`dot-${axis.key}`}
            cx={p.x}
            cy={p.y}
            r={2.2}
            fill={COLORS.electric}
            stroke={COLORS.white}
            strokeWidth={0.9}
          />
        );
      })}

      {/* Labels */}
      {axes.map((axis, i) => {
        const labelRadius = radius + 14;
        const a = angleFor(i);
        const lx = cx + Math.cos(a) * labelRadius;
        const ly = cy + Math.sin(a) * labelRadius;
        const anchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
            ? "start"
            : "end";
        return (
          <G key={`label-${axis.key}`}>
            <Text
              x={lx}
              y={ly}
              style={{ fontFamily: MONO_BOLD, fontSize: 6, fill: COLORS.inkMuted }}
              textAnchor={anchor as "start" | "middle" | "end"}
            >
              {axis.label.toUpperCase()}
            </Text>
            <Text
              x={lx}
              y={ly + 7}
              style={{ fontFamily: MONO_BOLD, fontSize: 6.5, fill: COLORS.ink }}
              textAnchor={anchor as "start" | "middle" | "end"}
            >
              {Math.round(axis.value)}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

function PdfDial({ score, level, size }: { score: number; level: string; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const startAngle = 135;
  const sweep = 270;
  const fraction = Math.max(0, Math.min(1, score / 3));

  const polar = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
  };
  const arcPath = (fromDeg: number, toDeg: number) => {
    const start = polar(fromDeg);
    const end = polar(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  };
  const isWarning = score <= 1;
  const accent = isWarning ? COLORS.warning : COLORS.electric;
  const fillEndAngle = startAngle + sweep * fraction;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={arcPath(startAngle, startAngle + sweep)}
        fill="none"
        stroke={COLORS.line}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {fraction > 0.01 && (
        <Path
          d={arcPath(startAngle, fillEndAngle)}
          fill="none"
          stroke={accent}
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      <Text
        x={cx}
        y={cy + 5}
        style={{ fontFamily: SANS_BOLD, fontSize: 28, fill: COLORS.ink }}
        textAnchor="middle"
      >
        {score}
      </Text>
      <Text
        x={cx}
        y={cy + 17}
        style={{ fontFamily: MONO_BOLD, fontSize: 6.5, fill: COLORS.inkMuted }}
        textAnchor="middle"
      >
        / 3
      </Text>
      <Text
        x={cx}
        y={cy + r + 16}
        style={{ fontFamily: MONO_BOLD, fontSize: 7, fill: accent }}
        textAnchor="middle"
      >
        {level.toUpperCase()}
      </Text>
    </Svg>
  );
}

const PREF_TIERS: Array<"Avoided" | "Weak" | "Moderate" | "Strong" | "Very Strong"> = [
  "Avoided", "Weak", "Moderate", "Strong", "Very Strong",
];

function PrefTierBar({
  level,
  score,
}: {
  level: "Avoided" | "Weak" | "Moderate" | "Strong" | "Very Strong";
  score: number;
}) {
  const activeIdx = PREF_TIERS.indexOf(level);
  return (
    <View style={{ width: 130 }}>
      <View style={{ flexDirection: "row", gap: 2 }}>
        {PREF_TIERS.map((t, i) => (
          <View
            key={t}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: i <= activeIdx ? COLORS.electric : COLORS.line,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3 }}>
        <Text style={[styles.monoEyebrow, { fontSize: 7 }]}>{level.toUpperCase()}</Text>
        <Text style={[styles.monoLabel, { fontSize: 7 }]}>{score}/100</Text>
      </View>
    </View>
  );
}
