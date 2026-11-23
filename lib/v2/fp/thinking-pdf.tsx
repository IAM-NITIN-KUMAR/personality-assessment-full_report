import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ThinkingPage } from "./thinking";

// react-pdf counterpart of components/v2/thinking-page.tsx. Base-14 fonts only, like report-pdf.tsx.
const INK = "#0A0E1A", INK_700 = "#1A1D26", INK_500 = "#3A3D48", INK_400 = "#6B6F78", INK_300 = "#9CA0A8";
const LINE = "#E5E7EB", ACCENT = "#6e6ef0", CHIP_BG = "#f3f0fc", CARD_BG = "#fbfaff";
const SANS = "Helvetica", BOLD = "Helvetica-Bold", ITALIC = "Helvetica-Oblique", MONO_BOLD = "Courier-Bold";

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 34, paddingHorizontal: 34, fontSize: 9, color: INK_500, fontFamily: SANS },
  tag: { position: "absolute", top: 0, right: 0, backgroundColor: CHIP_BG, color: ACCENT, fontFamily: MONO_BOLD, fontSize: 7.5, paddingHorizontal: 10, paddingVertical: 5, borderBottomLeftRadius: 10 },
  eyebrow: { fontFamily: MONO_BOLD, fontSize: 7.5, color: ACCENT, letterSpacing: 1.2, textTransform: "uppercase" },
  title: { fontFamily: BOLD, fontSize: 19, color: INK, marginTop: 3, lineHeight: 1.15 },
  lead: { fontSize: 8.5, color: INK_400, lineHeight: 1.45, marginTop: 5, marginBottom: 12, maxWidth: 420 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stat: { flex: 1, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG, borderRadius: 8, padding: 8 },
  statLabel: { fontFamily: MONO_BOLD, fontSize: 6.5, color: INK_400, textTransform: "uppercase" },
  statValue: { fontFamily: BOLD, fontSize: 15, color: ACCENT, marginTop: 3 },
  statSub: { fontSize: 7, color: INK_500, marginTop: 3, lineHeight: 1.35 },
  box: { marginBottom: 11 },
  boxHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  num: { width: 13, height: 13, borderRadius: 6.5, backgroundColor: ACCENT, color: "#ffffff", fontFamily: MONO_BOLD, fontSize: 7.5, textAlign: "center", paddingTop: 2.5 },
  boxTitle: { fontFamily: BOLD, fontSize: 8.5, color: INK_700, textTransform: "uppercase", letterSpacing: 0.9 },
  card: { borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 8, marginBottom: 5 },
  body: { fontSize: 9, color: INK_700, lineHeight: 1.5 },
  note: { borderWidth: 1, borderColor: "#fde4b0", backgroundColor: "#fffaf0", borderRadius: 7, padding: 6, marginTop: 4, fontSize: 8, color: "#92400e", lineHeight: 1.4 },
  th: { flexDirection: "row", backgroundColor: CHIP_BG },
  thText: { flex: 1, fontFamily: MONO_BOLD, fontSize: 6.5, color: ACCENT, textTransform: "uppercase", padding: 5 },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: LINE },
  td: { flex: 1, fontSize: 8, lineHeight: 1.4, padding: 5, color: INK_500 },
  matchRow: { flexDirection: "row", gap: 6 },
  match: { flex: 1, borderWidth: 1, borderColor: LINE, backgroundColor: CARD_BG, borderRadius: 8, padding: 7 },
  matchName: { fontFamily: BOLD, fontSize: 9.5, color: INK, marginTop: 2 },
  matchSub: { fontSize: 7, color: INK_400, marginTop: 2 },
  chips: { fontSize: 6.8, color: ACCENT, marginTop: 4 },
  quote: { borderWidth: 1, borderColor: "#d9d6f7", backgroundColor: CHIP_BG, borderRadius: 8, padding: 9, marginBottom: 5 },
  quoteText: { fontFamily: BOLD, fontSize: 9.5, color: INK_700, lineHeight: 1.45 },
  twoCol: { flexDirection: "row", gap: 10 },
  dialRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dialName: { width: 46, fontFamily: BOLD, fontSize: 7.5, color: INK_500 },
  dialTrack: { flex: 1, height: 3, backgroundColor: LINE, borderRadius: 2 },
  dialDot: { position: "absolute", top: -3, width: 9, height: 9, borderRadius: 4.5, backgroundColor: ACCENT },
  foot: { marginTop: 6, fontSize: 7.5, color: INK_300 },
});

function Head({ n, children }: { n: number; children: string }) {
  return (
    <View style={s.boxHead}>
      {n > 0 ? <Text style={s.num}>{n}</Text> : <View style={{ width: 13, height: 13, borderRadius: 6.5, backgroundColor: CHIP_BG }} />}
      <Text style={s.boxTitle}>{children}</Text>
    </View>
  );
}

export function ThinkingPdfPage({ t, n, total }: { t: ThinkingPage; n: number; total: number }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.tag}>PAGE {n} OF {total}</Text>
      <Text style={s.eyebrow}>First principles</Text>
      <Text style={s.title}>How you are thinking about your next step</Text>
      <Text style={s.lead}>
        Your roots are the facts about you. Your route is rebuilt from them, not borrowed. This page sets what you assumed against what your results show.
      </Text>

      <View style={s.statRow}>
        <View style={s.stat}>
          <Text style={s.statLabel}>Starting confidence</Text>
          <Text style={s.statValue}>{t.confidence.average.toFixed(1)} / 5</Text>
          <Text style={s.statSub}>Career {t.confidence.career} · Workplace {t.confidence.workplace} · Next {t.confidence.next}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statLabel}>Assumption load</Text>
          <Text style={s.statValue}>{t.assumptions.band}</Text>
          <Text style={s.statSub}>{t.assumptions.total} of 12 beliefs worth testing</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statLabel}>After your coach session</Text>
          <Text style={s.statValue}>___ / 5</Text>
          <Text style={s.statSub}>Re-rate together and see how far it moved.</Text>
        </View>
      </View>

      <View style={s.box} wrap={false}>
        <Head n={1}>Where you started</Head>
        <View style={s.card}><Text style={s.body}>{t.started}</Text></View>
        {t.assumptions.reasonNotes.map((x) => (
          <Text key={x.group} style={s.note}>{x.label}: {x.text}</Text>
        ))}
      </View>

      <View style={s.box} wrap={false}>
        <Head n={2}>What you assumed, and what your results show</Head>
        {t.rows.length === 0 ? (
          <View style={s.card}><Text style={s.body}>Your current thinking already rests on your own reasons. The next step is to test it in the real world.</Text></View>
        ) : (
          <View style={{ borderWidth: 1, borderColor: LINE, borderRadius: 8, overflow: "hidden" }}>
            <View style={s.th}>
              <Text style={s.thText}>What you believed</Text>
              <Text style={s.thText}>What your results show</Text>
              <Text style={s.thText}>A question to explore</Text>
            </View>
            {t.rows.map((r, i) => (
              <View key={i} style={s.tr} wrap={false}>
                <Text style={[s.td, { fontFamily: BOLD, color: INK_700 }]}>&ldquo;{r.belief}&rdquo;</Text>
                <Text style={s.td}>{r.evidence}</Text>
                <Text style={[s.td, { fontFamily: ITALIC, color: "#4b4bd1" }]}>{r.question}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={s.box} wrap={false}>
        <Head n={0}>Your route, rebuilt from the facts</Head>
        <View style={s.matchRow}>
          {t.routes.map((r, i) => (
            <View key={r.career} style={s.match}>
              <Text style={s.statLabel}>Match {i + 1}{r.isNew ? " · new to you" : ""}</Text>
              <Text style={s.matchName}>{r.career}</Text>
              <Text style={s.matchSub}>{r.domain}</Text>
              <Text style={s.chips}>{r.matched.join(" · ")}</Text>
            </View>
          ))}
        </View>
        {t.combined && <Text style={[s.body, { marginTop: 5, fontSize: 8 }]}>{t.combined}</Text>}
        <View style={[s.card, { marginTop: 6 }]}>
          <Text style={[s.body, { fontFamily: BOLD }]}>Your best environment: {t.environment.description}</Text>
          <View style={{ marginTop: 5 }}>
            {t.environment.dials.map((d) => (
              <View key={d.label} style={s.dialRow}>
                <Text style={s.dialName}>{d.label}</Text>
                <View style={s.dialTrack}><View style={[s.dialDot, { left: `${((d.value - 1) / 4) * 100}%` }]} /></View>
              </View>
            ))}
          </View>
          {t.environment.comparison && <Text style={[s.body, { fontSize: 8, marginTop: 4 }]}>{t.environment.comparison}</Text>}
        </View>
      </View>

      <View style={s.box} wrap={false}>
        <Head n={3}>Your three conclusions</Head>
        {t.conclusions.map((c, i) => (
          <View key={i} style={s.quote}><Text style={s.quoteText}>{c}</Text></View>
        ))}
        <Text style={s.foot}>{t.saved ? "In your own words." : "Suggested wording. Edit it with your coach until it sounds like you."} {t.gap.next}</Text>
      </View>

      <View style={s.twoCol} wrap={false}>
        <View style={{ flex: 1 }}>
          <Head n={4}>Small tests · next 30 days</Head>
          {[t.tests.route, t.tests.environment, t.tests.next].map((x, i) => (
            <View key={i} style={s.card}><Text style={[s.body, { fontSize: 8 }]}>{x}</Text></View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Head n={5}>Questions for your coach</Head>
          {t.questions.map((q, i) => (
            <View key={i} style={s.card}><Text style={[s.body, { fontSize: 8 }]}>{q}</Text></View>
          ))}
          <View style={[s.card, { borderStyle: "dashed" }]}><Text style={[s.body, { fontSize: 8, color: INK_300 }]}>Your own question: ____________________</Text></View>
        </View>
      </View>
    </Page>
  );
}
