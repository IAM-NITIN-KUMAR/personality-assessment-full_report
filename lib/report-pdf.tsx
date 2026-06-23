"use client";

import React from "react";
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
  Font,
} from "@react-pdf/renderer";
import { ReportData, Stat } from "./report-data";
import { DIMENSION_LABELS, Dimension } from "./types";

// Register premium custom fonts from local public directory
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

const SERIF_BOLD = "PlusJakartaSans-Bold";
const SERIF_ITALIC = "PlusJakartaSans-Italic";
const SANS = "Outfit";
const SANS_BOLD = "Outfit-Bold";
const SANS_OBL = "Outfit";
const MONO = "JetBrainsMono";
const MONO_BOLD = "JetBrainsMono-Bold";

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
});function PdfLogo({ size }: { size: number }) {
  return (
    <Svg style={{ width: size, height: size }} viewBox="0 0 64 64">
      <Path
        d="M 6 22 C 18 22, 26 24, 32 32 C 38 40, 46 42, 58 42"
        stroke="#6e6ef0"
        strokeWidth={8.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M 42 6 C 42 18, 40 26, 32 32 C 24 38, 22 46, 22 58"
        stroke="#6e6ef0"
        strokeWidth={8.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function PdfBulletIcon({ index }: { index: number }) {
  return (
    <Svg style={{ width: 10, height: 10 }} viewBox="0 0 24 24">
      {index === 0 && (
        <Path
          d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
          stroke="#6e6ef0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {index === 1 && (
        <Path
          d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 5l-8 8M19 12l-8 8M19 5a5 5 0 0 0-7 7l7-7Z"
          stroke="#6e6ef0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {index === 2 && (
        <Path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="#6e6ef0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {index === 3 && (
        <Path
          d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12zM12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"
          stroke="#6e6ef0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </Svg>
  );
}

const pdfStyles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingTop: 55,
    paddingBottom: 50,
    backgroundColor: "#FFFFFF",
    color: "#0A0E1A",
    fontFamily: SANS,
    fontSize: 8.5,
    lineHeight: 1.35,
  },
  header: {
    position: "absolute",
    top: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 6,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandText: {
    fontFamily: SANS_BOLD,
    fontSize: 15,
    color: "#0A0E1A",
  },
  headerMeta: {
    textAlign: "right",
  },
  headerMetaTitle: {
    fontFamily: SANS_BOLD,
    fontSize: 8,
    color: "#1A1D26",
  },
  headerMetaSub: {
    fontFamily: MONO,
    fontSize: 6.5,
    color: "#9CA0A8",
    marginTop: 1,
  },
  insightSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 12,
  },
  insightText: {
    flex: 1.1,
  },
  insightTitle: {
    fontFamily: SANS_BOLD,
    fontSize: 13,
    letterSpacing: -0.3,
    color: "#0A0E1A",
    lineHeight: 1.25,
    marginBottom: 4,
  },
  insightArchetype: {
    fontFamily: MONO_BOLD,
    fontSize: 9,
    color: "#6e6ef0",
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 4,
  },
  insightDesc: {
    fontFamily: SANS,
    fontSize: 8.5,
    color: "#6B6F78",
    lineHeight: 1.4,
  },
  profileCard: {
    flex: 0.9,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#f8f7fd",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0A0E1A",
    color: "#FFFFFF",
    fontFamily: MONO_BOLD,
    fontSize: 10,
    textAlign: "center",
    paddingTop: 7,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: SANS_BOLD,
    fontSize: 10,
    color: "#0A0E1A",
  },
  profileSub: {
    fontFamily: SANS_BOLD,
    fontSize: 7.5,
    color: "#6e6ef0",
    marginTop: 1,
  },
  profileMeta: {
    fontFamily: MONO,
    fontSize: 7,
    color: "#6B6F78",
    marginTop: 2,
  },
  mainGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 12,
  },
  strengthsColumn: {
    flex: 1.1,
    gap: 6,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  sectionTitleText: {
    fontFamily: SANS_BOLD,
    fontSize: 9,
    letterSpacing: 0.5,
    color: "#1A1D26",
    textTransform: "uppercase",
  },
  sectionSubtitleText: {
    fontFamily: MONO_BOLD,
    fontSize: 7.5,
    color: "#6e6ef0",
    textTransform: "uppercase",
  },
  strengthCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    backgroundColor: "#fbfaff",
    padding: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
  },
  strengthIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#f3f0fc",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 1.5,
  },
  strengthContent: {
    flex: 1,
  },
  strengthTitle: {
    fontFamily: SANS_BOLD,
    fontSize: 8.5,
    color: "#1A1D26",
  },
  strengthDesc: {
    fontFamily: SANS,
    fontSize: 8,
    color: "#6B6F78",
    marginTop: 1,
    lineHeight: 1.25,
  },
  radarColumn: {
    flex: 0.9,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 8,
    position: "relative",
  },
  radarLabelContainer: {
    position: "absolute",
    alignItems: "center",
  },
  radarLabelText: {
    fontFamily: SANS_BOLD,
    fontSize: 7.5,
    color: "#1A1D26",
  },
  radarLabelScore: {
    fontFamily: MONO_BOLD,
    fontSize: 6.5,
    color: "#9CA0A8",
    marginTop: 0.5,
  },
  matchesSection: {
    marginBottom: 12,
  },
  matchesGrid: {
    flexDirection: "row",
    gap: 6,
  },
  matchCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#f8f7fd",
    padding: 8,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 6,
    minHeight: 95,
  },
  matchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  matchBadge: {
    fontFamily: MONO_BOLD,
    fontSize: 7,
    color: "#6e6ef0",
    backgroundColor: "#f3f0fc",
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 2,
  },
  matchCardIndexContainer: {
    backgroundColor: "#6e6ef0",
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  matchCardIndexText: {
    fontFamily: MONO_BOLD,
    fontSize: 7.5,
    color: "#FFFFFF",
    textAlign: "center",
  },
  matchTitle: {
    fontFamily: SANS_BOLD,
    fontSize: 8,
    color: "#1A1D26",
    lineHeight: 1.15,
  },
  matchWhy: {
    fontFamily: SANS,
    fontSize: 7.5,
    color: "#6B6F78",
    marginTop: 2,
    lineHeight: 1.2,
  },
  bottomGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 12,
  },
  bottomColumn: {
    flex: 1,
    gap: 5,
  },
  checkrow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
    marginBottom: 4,
  },
  checkIcon: {
    fontFamily: SANS_BOLD,
    fontSize: 7.5,
    color: "#16A34A",
  },
  checkText: {
    fontFamily: SANS,
    fontSize: 8,
    color: "#3A3D48",
    flex: 1,
    lineHeight: 1.25,
  },
  stepNumContainer: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumText: {
    fontFamily: MONO_BOLD,
    fontSize: 7,
    color: "#FFFFFF",
    textAlign: "center",
  },
  stepText: {
    fontFamily: SANS_BOLD,
    fontSize: 8,
    color: "#3A3D48",
    flex: 1,
    lineHeight: 1.25,
  },
  quoteSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: "center",
    marginBottom: 4,
  },
  quoteText: {
    fontFamily: SERIF_ITALIC,
    fontSize: 9,
    color: "#3A3D48",
    textAlign: "center",
    maxWidth: 300,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerBrandText: {
    fontFamily: SANS_BOLD,
    fontSize: 8.5,
    color: "#6B6F78",
  },
  footerPageNum: {
    fontFamily: MONO_BOLD,
    fontSize: 7,
    color: "#6B6F78",
  },
  footerLink: {
    fontFamily: SANS_BOLD,
    fontSize: 8,
    color: "#6e6ef0",
  },
});

export function ReportDocument({ data }: { data: ReportData }) {
  // Convert -100..100 dimension scores to clean 0..10 radar scores
  const dimMap = data.rootsReadout.reduce(
    (acc, r) => ({ ...acc, [r.dimension]: r.value }),
    {} as Record<Dimension, number>
  );

  const scale = (val: number) => {
    const raw = 7.8 + (val / 100) * 1.4; // maps range roughly between 6.4 and 9.2
    return Math.round(raw * 10) / 10;
  };

  const scores = {
    analytical: scale(dimMap.decision_style ?? 0),
    entrepreneurial: scale(dimMap.risk ?? 0),
    practical: scale(dimMap.structure ?? 0),
    leadership: scale(dimMap.drive ?? 0),
    peopleSkills: scale(dimMap.social ?? 0),
    creative: scale(dimMap.energy ?? 0),
  };

  const topEnvironments = [...data.environmentFit]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((env, idx) => {
      const colors = ["#10b981", "#6e6ef0", "#0ea5e9"];
      return {
        label: env.key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        score: env.score,
        color: colors[idx % colors.length]
      };
    });


  const careerChartData = data.commonCareerPaths.map((path, idx) => {
    const colors = ["#6e6ef0", "#f3a6d9", "#3b82f6", "#10b981"];
    return {
      label: path.role,
      percentage: path.percentage,
      color: colors[idx % colors.length]
    };
  });


  const initials = data.profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let hash = 0;
  const name = data.profile.name;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const suffix = Math.abs(hash % 9000) + 1000;
  const profileId = `SS-052025-${suffix}`;

  const todayStr = today();

  // Strengths
  const strengths = [];
  const s0 = data.stats.find((s) => s.key === "strength-0");
  if (s0) strengths.push({ title: `Strength: ${s0.value}`, desc: s0.detail });
  const s1 = data.stats.find((s) => s.key === "strength-1");
  if (s1) strengths.push({ title: `Strength: ${s1.value}`, desc: s1.detail });
  const s2 = data.stats.find((s) => s.key === "strength-2");
  if (s2) strengths.push({ title: `Strength: ${s2.value}`, desc: s2.detail });
  const talent = data.stats.find((s) => s.key === "hidden-talent");
  if (talent) {
    strengths.push({ title: `Hidden Talent: ${talent.value}`, desc: talent.detail });
  } else {
    const teamRole = data.stats.find((s) => s.key === "team-role");
    if (teamRole) {
      strengths.push({ title: `Team Role: ${teamRole.value}`, desc: teamRole.detail });
    }
  }

  // Matches
  const bestMatches = [];
  if (data.topDegrees && data.topDegrees.length > 0) {
    bestMatches.push(...data.topDegrees.slice(0, 2));
  }
  if (data.alternativeDegrees && data.alternativeDegrees.length > 0) {
    bestMatches.push(...data.alternativeDegrees.slice(0, 2));
  }
  while (bestMatches.length < 4) {
    bestMatches.push({
      title: "Exploring Pathways",
      why: "Shortlist other interesting adjacent domains with your counsellor.",
      match: 75,
    });
  }

  const renderHeader = () => (
    <View style={pdfStyles.header} fixed>
      <View style={pdfStyles.logoSection}>
        <PdfLogo size={22} />
        <Text style={pdfStyles.brandText}>SecureSteps</Text>
      </View>
      <View style={pdfStyles.headerMeta}>
        <Text style={pdfStyles.headerMetaTitle}>Your SecureSteps Report</Text>
        <Text style={pdfStyles.headerMetaSub}>Generated on: {todayStr}</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={pdfStyles.footer} fixed>
      <View style={pdfStyles.footerBrand}>
        <PdfLogo size={14} />
        <Text style={pdfStyles.footerBrandText}>SecureSteps</Text>
      </View>
      <Text style={pdfStyles.footerPageNum} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
      <Text style={pdfStyles.footerLink}>
        If you want more info, visit https://www.securesteps.co.in/
      </Text>
    </View>
  );

  return (
    <Document
      title={`Roots & Routes — ${data.profile.name}`}
      author="Secure Steps"
      subject="Personality & career-fit assessment report"
    >
      <Page size="A4" style={pdfStyles.page} wrap>
        {renderHeader()}

        {/* SECTION 1: Personal Assessment & Strengths */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          {/* Pathway Insight Title & Profile Card Grid */}
          <View style={pdfStyles.insightSection}>
            <View style={pdfStyles.insightText}>
              <Text style={pdfStyles.insightTitle}>YOUR PERSONAL PATHWAY INSIGHT</Text>
              <Text style={pdfStyles.insightArchetype}>ARCHETYPE: {data.archetype.name.toUpperCase()}</Text>
              <Text style={pdfStyles.insightDesc}>
                This is you — decoded. Your answers reveal your natural strengths, what drives you, and the paths that will help you thrive.
              </Text>
            </View>

            {/* User Profile Card */}
            <View style={pdfStyles.profileCard}>
              <View style={pdfStyles.avatar}>
                <Text>{initials}</Text>
              </View>
              <View style={pdfStyles.profileInfo}>
                <Text style={pdfStyles.profileName}>{data.profile.name}</Text>
                <Text style={pdfStyles.profileMeta}>Profile ID: {profileId}</Text>
                <Text style={pdfStyles.profileMeta}>Assessment: SecureSteps Discovery</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 2: Core Strengths */}
        <View style={{ marginBottom: 10 }}>
          <View style={[pdfStyles.sectionHeading, { marginBottom: 10 }]} wrap={false}>
            <Text style={pdfStyles.sectionTitleText}>YOUR CORE STRENGTHS</Text>
          </View>

          <View style={{ gap: 8 }}>
            {strengths.map((str, idx) => (
              <View key={idx} style={[pdfStyles.strengthCard, { padding: 8 }]} wrap={false}>
                <View style={pdfStyles.strengthIconContainer}>
                  <PdfBulletIcon index={idx} />
                </View>
                <View style={pdfStyles.strengthContent}>
                  <Text style={pdfStyles.strengthTitle}>{str.title}</Text>
                  <Text style={pdfStyles.strengthDesc}>{str.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 3: Path Fit Score */}
        <View wrap={false} style={{ marginBottom: 10, alignItems: "center" }}>
          <View style={[pdfStyles.sectionHeading, { marginBottom: 4, alignSelf: "flex-start" }]}>
            <Text style={pdfStyles.sectionTitleText}>YOUR PATH FIT SCORE</Text>
          </View>
          <Text style={[pdfStyles.sectionSubtitleText, { marginBottom: 6, alignSelf: "flex-start" }]}>
            {data.archetype.name.toUpperCase()} PATHWAY
          </Text>

          {/* Radar Chart Container */}
          <View style={{ position: "relative", width: 200, height: 200, justifyContent: "center", alignItems: "center", marginTop: 6, alignSelf: "center" }}>
            <PdfRadar
              axes={[
                { key: "analytical", label: "Analytical", value: scores.analytical * 10 },
                { key: "creative", label: "Creative", value: scores.creative * 10 },
                { key: "leadership", label: "Leadership", value: scores.leadership * 10 },
                { key: "peopleSkills", label: "People Skills", value: scores.peopleSkills * 10 },
                { key: "practical", label: "Practical", value: scores.practical * 10 },
                { key: "entrepreneurial", label: "Entrepreneurial", value: scores.entrepreneurial * 10 },
              ]}
              size={140}
            />

            {/* Absolute labels */}
            <View style={[pdfStyles.radarLabelContainer, { top: 6, left: 0, right: 0 }]}>
              <Text style={pdfStyles.radarLabelText}>Analytical</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.analytical.toFixed(1)}/10</Text>
            </View>
            <View style={[pdfStyles.radarLabelContainer, { top: 48, right: 0, alignItems: "flex-start" }]}>
              <Text style={pdfStyles.radarLabelText}>Creative</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.creative.toFixed(1)}/10</Text>
            </View>
            <View style={[pdfStyles.radarLabelContainer, { bottom: 48, right: 0, alignItems: "flex-start" }]}>
              <Text style={pdfStyles.radarLabelText}>Leadership</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.leadership.toFixed(1)}/10</Text>
            </View>
            <View style={[pdfStyles.radarLabelContainer, { bottom: 6, left: 0, right: 0 }]}>
              <Text style={pdfStyles.radarLabelText}>People Skills</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.peopleSkills.toFixed(1)}/10</Text>
            </View>
            <View style={[pdfStyles.radarLabelContainer, { bottom: 48, left: 0, alignItems: "flex-end" }]}>
              <Text style={pdfStyles.radarLabelText}>Practical</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.practical.toFixed(1)}/10</Text>
            </View>
            <View style={[pdfStyles.radarLabelContainer, { top: 48, left: 0, alignItems: "flex-end" }]}>
              <Text style={pdfStyles.radarLabelText}>Entrepreneurial</Text>
              <Text style={pdfStyles.radarLabelScore}>{scores.entrepreneurial.toFixed(1)}/10</Text>
            </View>
          </View>

          <Text style={{ fontFamily: SANS, fontSize: 7, color: COLORS.inkSoft, textAlign: "center", marginTop: 8, maxWidth: 360, lineHeight: 1.35 }}>
            This radar chart maps your personality footprint across six core dimensions. Larger shaded spreads indicate strong, active alignment with the behavioral expectations and tasks of the {data.archetype.name.toUpperCase()} pathway.
          </Text>

          {/* Detailed Dimension Insights */}
          <View style={{ width: "100%", marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 6 }}>
            {data.rootsReadout.map((item, idx) => {
              // Map database dimension to radar label
              let radarLabel = "";
              let scoreVal = 0;
              if (item.dimension === "decision_style") { radarLabel = "Analytical"; scoreVal = scores.analytical; }
              else if (item.dimension === "energy") { radarLabel = "Creative"; scoreVal = scores.creative; }
              else if (item.dimension === "structure") { radarLabel = "Practical"; scoreVal = scores.practical; }
              else if (item.dimension === "risk") { radarLabel = "Entrepreneurial"; scoreVal = scores.entrepreneurial; }
              else if (item.dimension === "social") { radarLabel = "People Skills"; scoreVal = scores.peopleSkills; }
              else if (item.dimension === "drive") { radarLabel = "Leadership"; scoreVal = scores.leadership; }

              return (
                <View key={idx} style={{ width: "48%", backgroundColor: "#fbfaff", borderWidth: 0.5, borderColor: COLORS.line, borderRadius: 6, padding: 5, marginBottom: 2 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 1 }}>
                    <Text style={{ fontFamily: SANS_BOLD, fontSize: 7.5, color: COLORS.ink }}>{radarLabel}</Text>
                    <Text style={{ fontFamily: MONO_BOLD, fontSize: 6.5, color: COLORS.inkMuted }}>{scoreVal.toFixed(1)}/10</Text>
                  </View>
                  <Text style={{ fontFamily: SANS, fontSize: 6.5, color: COLORS.inkSoft, lineHeight: 1.2 }}>{item.sentence}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION 4: Key Drivers */}
        <View break wrap={false} style={{ marginBottom: 10 }}>
          <View style={[pdfStyles.sectionHeading, { marginBottom: 8 }]} wrap={false}>
            <Text style={pdfStyles.sectionTitleText}>KEY DRIVERS</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {data.drivers.map((driver, idx) => (
              <View key={idx} style={{ width: "48%", backgroundColor: "#fbfaff", borderWidth: 1, borderColor: COLORS.line, borderStyle: "solid", borderRadius: 8, padding: 10, marginBottom: 8 }} wrap={false}>
                <Text style={{ fontFamily: MONO_BOLD, fontSize: 7, color: COLORS.inkMuted, textTransform: "uppercase", marginBottom: 2 }}>{driver.category}</Text>
                <Text style={{ fontFamily: SANS_BOLD, fontSize: 9.5, color: COLORS.electric, marginBottom: 4 }}>{driver.label}</Text>
                <Text style={{ fontFamily: SANS, fontSize: 8.5, color: COLORS.ink, lineHeight: 1.4 }}>{driver.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 5: Work Preferences & Aptitudes */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={pdfStyles.bottomGrid}>
            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>TOP PREFERENCES</Text>
              </View>
              {[...data.workPreferences].sort((a,b) => b.score - a.score).slice(0,3).map((pref, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontFamily: SANS_BOLD, fontSize: 9, color: COLORS.ink }}>{pref.label}</Text>
                    <Text style={{ fontFamily: MONO_BOLD, fontSize: 7, color: COLORS.inkMuted }}>{pref.level}</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: COLORS.line, borderRadius: 2, marginBottom: 2, overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${pref.score}%`, backgroundColor: COLORS.electric, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontFamily: SANS, fontSize: 8, color: COLORS.ink, lineHeight: 1.3 }}>{pref.detail}</Text>
                </View>
              ))}
            </View>

            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>TOP APTITUDES</Text>
              </View>
              {[...data.workAptitudes].sort((a,b) => b.score - a.score).slice(0,3).map((apt, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontFamily: SANS_BOLD, fontSize: 9, color: COLORS.ink }}>{apt.label}</Text>
                    <Text style={{ fontFamily: MONO_BOLD, fontSize: 7, color: COLORS.inkMuted }}>{apt.score}/100</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: COLORS.line, borderRadius: 2, marginBottom: 2, overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${apt.score}%`, backgroundColor: COLORS.electric, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontFamily: SANS, fontSize: 8, color: COLORS.ink, lineHeight: 1.3 }}>{apt.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 6: Environment & Career Distribution */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={pdfStyles.bottomGrid}>
            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>IDEAL ENVIRONMENT</Text>
              </View>
              <View style={{ borderWidth: 0.7, borderColor: COLORS.line, borderRadius: 8, padding: 8, backgroundColor: "#fbfaff", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <PdfConcentricRings items={topEnvironments} />
                  <View style={{ flex: 1, gap: 5 }}>
                    {topEnvironments.slice().reverse().map((item, idx) => (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={{ fontFamily: SANS_BOLD, fontSize: 7, color: COLORS.inkSoft, maxWidth: 80 }}>{item.label}</Text>
                          <Text style={{ fontFamily: MONO_BOLD, fontSize: 7, color: COLORS.inkMuted }}>{item.score}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={{ fontFamily: SANS, fontSize: 6.5, color: COLORS.inkMuted, marginTop: 4, lineHeight: 1.25 }}>
                  These concentric rings map your alignment with distinct organizational cultures, workplace pace, and team dynamics where you will perform most naturally.
                </Text>
              </View>
            </View>

            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>CAREER DISTRIBUTION</Text>
              </View>
              <View style={{ borderWidth: 0.7, borderColor: COLORS.line, borderRadius: 8, padding: 8, backgroundColor: "#fbfaff", gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <PdfDonut items={careerChartData} />
                  <View style={{ flex: 1, gap: 5 }}>
                    {careerChartData.map((item, idx) => (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={{ fontFamily: SANS_BOLD, fontSize: 7, color: COLORS.inkSoft, maxWidth: 80 }}>{item.label}</Text>
                          <Text style={{ fontFamily: MONO_BOLD, fontSize: 7, color: COLORS.inkMuted }}>{item.percentage}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={{ fontFamily: SANS, fontSize: 6.5, color: COLORS.inkMuted, marginTop: 4, lineHeight: 1.25 }}>
                  This donut breakdown represents the typical distribution of specific career pathways and opening roles pursued by professionals of your archetype.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 7: Career Traits Analysis */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={[pdfStyles.sectionHeading, { marginBottom: 8 }]} wrap={false}>
            <Text style={pdfStyles.sectionTitleText}>CAREER TRAITS ANALYSIS</Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 }}>
            {data.careerTraits.map((group, gIdx) => (
              <View key={gIdx} style={{ width: "48%", marginBottom: 12 }} wrap={false}>
                <Text style={{ fontFamily: SANS_BOLD, fontSize: 8.5, color: "#6e6ef0", borderBottomWidth: 0.5, borderBottomColor: COLORS.line, paddingBottom: 3, marginBottom: 6, textTransform: "uppercase" }}>{group.category}</Text>
                {group.traits.map((trait, tIdx) => (
                  <View key={tIdx} style={{ backgroundColor: "#fbfaff", borderWidth: 0.5, borderColor: COLORS.line, borderRadius: 6, padding: 6, marginBottom: 5 }}>
                    <Text style={{ fontFamily: SANS_BOLD, fontSize: 8, color: COLORS.ink, marginBottom: 2 }}>{trait.label}</Text>
                    <Text style={{ fontFamily: SANS, fontSize: 7, color: COLORS.inkMuted, lineHeight: 1.25 }}>{trait.score > 50 ? trait.highLabel : trait.lowLabel}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 8: Best Matches */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={pdfStyles.matchesSection}>
            <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
              <Text style={pdfStyles.sectionTitleText}>BEST PATH MATCHES FOR YOU</Text>
            </View>

            <View style={pdfStyles.matchesGrid}>
              {bestMatches.map((match, idx) => (
                <View key={idx} style={pdfStyles.matchCard}>
                  <View style={pdfStyles.matchCardHeader}>
                    <View style={pdfStyles.matchCardIndexContainer}>
                      <Text style={pdfStyles.matchCardIndexText}>{idx + 1}</Text>
                    </View>
                    {match.match && (
                      <Text style={pdfStyles.matchBadge}>{match.match}% FIT</Text>
                    )}
                  </View>
                  <View>
                    <Text style={pdfStyles.matchTitle}>{match.title}</Text>
                    <Text style={pdfStyles.matchWhy}>{match.why}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 9: Alternative Paths */}
        {data.alternativeDegrees.length > 0 && (
          <View wrap={false} style={{ marginBottom: 10 }}>
            <View style={[pdfStyles.matchesSection]}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>ALTERNATIVE PATHWAYS</Text>
              </View>
              <View style={pdfStyles.matchesGrid}>
                {data.alternativeDegrees.map((match, idx) => (
                  <View key={idx} style={pdfStyles.matchCard}>
                    <View style={pdfStyles.matchCardHeader}>
                      <Text style={[pdfStyles.matchBadge, { backgroundColor: COLORS.line, color: COLORS.inkMuted }]}>{match.match}% FIT</Text>
                    </View>
                    <View>
                      <Text style={pdfStyles.matchTitle}>{match.title}</Text>
                      <Text style={pdfStyles.matchWhy}>{match.why}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* SECTION 10: Shared Interests */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={[pdfStyles.matchesSection, { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line, borderBottomStyle: "solid" }]}>
            <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
              <Text style={pdfStyles.sectionTitleText}>SHARED INTERESTS</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {data.sharedInterests.map((interest, idx) => (
                <View key={idx} style={{ backgroundColor: "#f8f7fd", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.line, borderStyle: "solid", marginRight: 6, marginBottom: 6 }}>
                  <Text style={{ fontFamily: SANS_BOLD, fontSize: 8, color: COLORS.ink }}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 11: Growth Tips & Next Steps */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <View style={[pdfStyles.bottomGrid, { marginBottom: 15 }]}>
            {/* Growth Tips */}
            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>GROWTH TIPS FOR YOU</Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <Text style={pdfStyles.checkIcon}>✓</Text>
                <Text style={pdfStyles.checkText}>
                  <Text style={{ fontFamily: SANS_BOLD }}>Focus Your Energy:</Text> Pick a direction and go deep. Consistency &gt; perfection.
                </Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <Text style={pdfStyles.checkIcon}>✓</Text>
                <Text style={pdfStyles.checkText}>
                  <Text style={{ fontFamily: SANS_BOLD }}>Build Real-World Skills:</Text> Projects, internships and exposure will set you apart.
                </Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <Text style={pdfStyles.checkIcon}>✓</Text>
                <Text style={pdfStyles.checkText}>
                  <Text style={{ fontFamily: SANS_BOLD }}>Trust Your Voice:</Text> You have strong ideas. Share them more and lead with confidence.
                </Text>
              </View>
            </View>

            {/* Next Steps */}
            <View style={pdfStyles.bottomColumn}>
              <View style={[pdfStyles.sectionHeading, { marginBottom: 6 }]}>
                <Text style={pdfStyles.sectionTitleText}>YOUR NEXT STEPS</Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <View style={pdfStyles.stepNumContainer}>
                  <Text style={pdfStyles.stepNumText}>1</Text>
                </View>
                <Text style={pdfStyles.stepText}>Explore these paths in detail with our 1:1 counselling.</Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <View style={pdfStyles.stepNumContainer}>
                  <Text style={pdfStyles.stepNumText}>2</Text>
                </View>
                <Text style={pdfStyles.stepText}>Shortlist colleges & courses that fit your profile.</Text>
              </View>
              <View style={pdfStyles.checkrow}>
                <View style={pdfStyles.stepNumContainer}>
                  <Text style={pdfStyles.stepNumText}>3</Text>
                </View>
                <Text style={pdfStyles.stepText}>Build your roadmap and start early.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 12: Note to Parents & Quote */}
        <View style={{ marginBottom: 10 }}>
          <View wrap={false} style={{ borderWidth: 0.7, borderColor: COLORS.line, borderRadius: 8, backgroundColor: "#f8f7fd", padding: 12, marginTop: 5 }}>
            <Text style={[styles.h4, { marginBottom: 8, color: COLORS.ink }]}>
              {data.parentLetter.greeting}
            </Text>
            {data.parentLetter.paragraphs.map((p, i) => (
              <Text
                key={i}
                style={[styles.body, { color: COLORS.inkSoft, marginBottom: 6, lineHeight: 1.4, fontSize: 8.5 }]}
              >
                {p}
              </Text>
            ))}
            <View style={{ marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: COLORS.line, borderStyle: "solid" }}>
              {data.parentLetter.signoff.split("\n").map((line, i) => (
                <Text key={i} style={[styles.body, { color: COLORS.inkMuted, fontSize: 8.5 }]}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          {/* Quote Block */}
          <View wrap={false} style={[pdfStyles.quoteSection, { marginTop: 10 }]}>
            <Text style={pdfStyles.quoteText}>
              "You don't need to have it all figured out. You just need the right direction."
            </Text>
          </View>
        </View>

        {renderFooter()}
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
  const dashLen = Math.max(0.1, circumference * fillFraction);
  const restLen = Math.max(0.1, circumference - dashLen);

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
        fill="#6e6ef0"
        fillOpacity={0.14}
        stroke="#6e6ef0"
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
            fill="#6e6ef0"
            stroke={COLORS.white}
            strokeWidth={0.9}
          />
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

function PdfConcentricRings({
  items
}: {
  items: Array<{ label: string; score: number; color: string }>
}) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 8;
  const gap = 4;
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {items.map((item, idx) => {
        const r = 20 + idx * (strokeWidth + gap);
        const circumference = 2 * Math.PI * r;
        const fillFraction = Math.max(0, Math.min(1, item.score / 100));
        const dashLen = Math.max(0.1, circumference * fillFraction);
        const restLen = Math.max(0.1, circumference - dashLen);
        
        return (
          <G key={idx}>
            {/* Background track */}
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              strokeOpacity={0.4}
            />
            {/* Filled track */}
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dashLen.toFixed(1)} ${restLen.toFixed(1)}`}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </G>
        );
      })}
    </Svg>
  );
}

function PdfDonut({
  items
}: {
  items: Array<{ label: string; percentage: number; color: string }>
}) {
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = 32;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * r;
  
  let accumPercentage = 0;
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {items.map((item, idx) => {
        const fraction = item.percentage / 100;
        const dashLen = Math.max(0.1, circumference * fraction);
        const restLen = Math.max(0.1, circumference - dashLen);
        const rotation = -90 + accumPercentage * 360;
        accumPercentage += fraction;
        
        return (
          <Circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen.toFixed(1)} ${restLen.toFixed(1)}`}
            transform={`rotate(${rotation.toFixed(1)} ${cx} ${cy})`}
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="#FFFFFF" />
    </Svg>
  );
}


