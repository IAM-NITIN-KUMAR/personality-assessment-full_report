import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { DIM_LABELS, DIM_PRIORITY } from "./types";
import type { ReportV2 } from "./types";

// Register premium custom fonts from local public directory
// (copied verbatim from lib/report-pdf.tsx so the PDF matches app typography;
// paths are absolute /fonts/... so no adjustment is needed for this file's
// location under lib/v2/.)
Font.register({
  family: "Outfit",
  src: "/fonts/Outfit-Regular.ttf",
});

Font.register({
  family: "Outfit-Bold",
  src: "/fonts/Outfit-Bold.ttf",
});

Font.register({
  family: "Outfit-ExtraBold",
  src: "/fonts/Outfit-ExtraBold.ttf",
});

Font.register({
  family: "PlusJakartaSans",
  src: "/fonts/PlusJakartaSans-Regular.ttf",
});

Font.register({
  family: "PlusJakartaSans-Bold",
  src: "/fonts/PlusJakartaSans-Bold.ttf",
});

Font.register({
  family: "PlusJakartaSans-Italic",
  src: "/fonts/PlusJakartaSans-Italic.ttf",
});

Font.register({
  family: "JetBrainsMono",
  src: "/fonts/JetBrainsMono-Regular.ttf",
});

Font.register({
  family: "JetBrainsMono-Bold",
  src: "/fonts/JetBrainsMono-Bold.ttf",
});

const SANS = "Outfit";
const SANS_BOLD = "Outfit-Bold";
const SERIF_BOLD = "PlusJakartaSans-Bold";
const SERIF_ITALIC = "PlusJakartaSans-Italic";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1e293b", fontFamily: SANS },
  muted: { color: "#64748b" },
  h1: { fontSize: 20, fontFamily: SANS_BOLD, marginTop: 2 },
  sectionTitle: {
    fontSize: 9,
    marginTop: 16,
    marginBottom: 6,
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: SANS_BOLD,
  },
  card: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, padding: 8, marginBottom: 6 },
  cardTitle: { fontFamily: SANS_BOLD },
  animalName: { fontSize: 16, fontFamily: SERIF_BOLD },
  rendering: { fontFamily: SERIF_ITALIC },
  footer: { marginTop: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0", fontSize: 8, color: "#94a3b8" },
});

export default function ReportPdfV2({ report }: { report: ReportV2 }) {
  const t = report.yourType;
  return (
    <Document title={`${report.header.assessmentName} — ${report.header.name}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.muted}>{report.header.assessmentName}</Text>
        <Text style={s.h1}>{report.header.name}</Text>
        <Text style={s.muted}>
          {report.header.profileId} · {report.header.date}
        </Text>

        <Text style={s.sectionTitle}>Your Type</Text>
        {t.kind === "archetype" ? (
          <View>
            <Text style={s.animalName}>THE {t.animal.toUpperCase()}</Text>
            <Text style={s.muted}>{t.rendering}</Text>
            <Text style={s.cardTitle}>
              {t.name}. <Text style={{ fontFamily: SANS }}>{t.strapline}</Text>
            </Text>
          </View>
        ) : (
          <Text>{t.copy}</Text>
        )}

        <Text style={s.sectionTitle}>Core Strengths</Text>
        {report.coreStrengths.map((c) => (
          <Text key={c.label}>
            • {c.heading}. {c.sentence} ({c.sourceIds.join(", ")})
          </Text>
        ))}

        {report.state === "full" && (
          <>
            <Text style={s.sectionTitle}>Path Fit</Text>
            {DIM_PRIORITY.map((dim) => (
              <Text key={dim}>
                {DIM_LABELS[dim]}: {report.radar[dim]} / 10
              </Text>
            ))}

            <Text style={s.sectionTitle}>Career Cards</Text>
            {report.cards!.map((c, i) => (
              <View key={c.career} style={s.card}>
                <Text style={s.cardTitle}>
                  {i + 1}. {c.career} · {c.fit}% fit
                </Text>
                <Text>{c.whatLine}</Text>
                <Text>Next step: {c.nextStep}</Text>
                {c.honestyLine ? <Text style={s.muted}>{c.honestyLine}</Text> : null}
              </View>
            ))}

            {report.verdicts.length > 0 && (
              <>
                <Text style={s.sectionTitle}>We Feel</Text>
                {report.verdicts.map((v) => (
                  <Text key={v.id}>• {v.line}</Text>
                ))}
              </>
            )}
          </>
        )}

        <Text style={s.sectionTitle}>Growth Tips</Text>
        {report.growthTips.map((tip) => (
          <Text key={tip}>• {tip}</Text>
        ))}

        <Text style={s.sectionTitle}>Next Steps</Text>
        <Text>1. {report.nextSteps.counselling}</Text>
        <Text>2. {report.nextSteps.exposure}</Text>
        <Text>3. {report.nextSteps.conversation}</Text>
        {report.nextSteps.abroad ? <Text>4. {report.nextSteps.abroad}</Text> : null}

        <Text style={s.footer}>
          This report reflects what your answers showed about approach and preference. It does not measure
          ability. · Secure Steps
        </Text>
      </Page>
    </Document>
  );
}
