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
  Instagram,
  Facebook,
  Quote,
  Lightbulb
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ReportData } from "@/lib/report-data";
import { Dimension } from "@/lib/types";

// Dynamic Core Strengths definitions mapped to user Archetypes
const ARCHETYPE_STRENGTHS: Record<string, Array<{ title: string; desc: string; icon: "bulb" | "rocket" | "group" | "compass" }>> = {
  "The Builder": [
    { title: "Independent Thinker", desc: "You like to think deeply, explore ideas, and form your own perspective.", icon: "bulb" },
    { title: "High Growth Drive", desc: "You're ambitious and motivated to build something meaningful.", icon: "rocket" },
    { title: "Execution Focused", desc: "You move fast, build momentum, and bring ideas to life.", icon: "group" },
    { title: "Resilient Driver", desc: "Obstacles don't stop you; they just trigger a pivot.", icon: "compass" }
  ],
  "The Strategist": [
    { title: "Analytical Mind", desc: "You break complex problems down into logical, clear paths.", icon: "bulb" },
    { title: "Forward Planner", desc: "You look two steps ahead to anticipate challenges and opportunities.", icon: "rocket" },
    { title: "Structure Builder", desc: "You create frameworks and systems that keep projects organized.", icon: "group" },
    { title: "Deliberate Choice", desc: "You make decisions based on mapping and careful evaluation.", icon: "compass" }
  ],
  "The Connector": [
    { title: "People Smart", desc: "You read the room instantly and know how to bring out the best in others.", icon: "group" },
    { title: "Collaborative Soul", desc: "You thrive in teams and believe great ideas happen in dialogue.", icon: "bulb" },
    { title: "Network Builder", desc: "You naturally bridge gaps and connect people to opportunities.", icon: "rocket" },
    { title: "Empathetic Leader", desc: "You listen deeply and build high-trust relationships easily.", icon: "compass" }
  ],
  "The Maverick": [
    { title: "Independent Thinker", desc: "You prefer forging a new trail over walking a pre-set road.", icon: "bulb" },
    { title: "Risk Tolerant", desc: "You embrace ambiguity and see opportunity where others see fear.", icon: "rocket" },
    { title: "Creative Innovator", desc: "You challenge conventional wisdom and find unique solutions.", icon: "compass" },
    { title: "Spontaneous Adaptability", desc: "You pivot quickly and thrive under changing circumstances.", icon: "group" }
  ],
  "The Anchor": [
    { title: "Calm & Steady", desc: "You remain the grounding force even in high-pressure situations.", icon: "compass" },
    { title: "System Guardian", desc: "You build and maintain structures that protect project quality.", icon: "group" },
    { title: "High Reliability", desc: "People trust you to follow through and keep promises.", icon: "bulb" },
    { title: "Disciplined Focus", desc: "You stay aligned with core values, refusing to chase every passing trend.", icon: "rocket" }
  ],
  "The Explorer": [
    { title: "Independent Thinker", desc: "You like to think deeply, explore ideas, and form your own perspective.", icon: "bulb" },
    { title: "High Growth Drive", desc: "You're ambitious and motivated to build something meaningful.", icon: "rocket" },
    { title: "People Smart", desc: "You value real connections and work well in teams when it matters.", icon: "group" },
    { title: "Curious & Adaptable", desc: "You enjoy exploring new things and adapting to different situations.", icon: "compass" }
  ]
};

const STRENGTH_ICONS = {
  bulb: Lightbulb,
  rocket: Rocket,
  group: Users,
  compass: Compass
};

const getMatchIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("business") || t.includes("management") || t.includes("commerce") || t.includes("hospitality")) {
    return Briefcase;
  }
  if (t.includes("computer") || t.includes("software") || t.includes("tech") || t.includes("engineering") || t.includes("code")) {
    return Code;
  }
  if (t.includes("finance") || t.includes("economics") || t.includes("quant") || t.includes("math")) {
    return LineChart;
  }
  if (t.includes("design") || t.includes("media") || t.includes("art") || t.includes("creative") || t.includes("architecture")) {
    return PenTool;
  }
  return Compass;
};

export function ReportView({ data }: { data: ReportData }) {
  // Convert -100..100 dimension scores to clean 0..10 radar scores
  const dimMap = useMemo(() => {
    return data.rootsReadout.reduce(
      (acc, r) => ({ ...acc, [r.dimension]: r.value }),
      {} as Record<Dimension, number>
    );
  }, [data.rootsReadout]);

  const scores = useMemo(() => {
    const scale = (val: number) => {
      const raw = 7.8 + (val / 100) * 1.4; // maps range roughly between 6.4 and 9.2
      return Math.round(raw * 10) / 10;
    };
    return {
      analytical: scale(dimMap.decision_style ?? 0),
      entrepreneurial: scale(dimMap.risk ?? 0),
      practical: scale(dimMap.structure ?? 0),
      leadership: scale(dimMap.drive ?? 0),
      peopleSkills: scale(dimMap.social ?? 0),
      creative: scale(dimMap.energy ?? 0),
    };
  }, [dimMap]);

  // Dynamic user avatar initials
  const initials = useMemo(() => {
    return data.profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [data.profile.name]);

  // Stable Profile ID generation
  const profileId = useMemo(() => {
    let hash = 0;
    const name = data.profile.name;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const suffix = Math.abs(hash % 9000) + 1000;
    return `SS-052025-${suffix}`;
  }, [data.profile.name]);

  // Generate dynamic 4 matches from degree shortlists
  const bestMatches = useMemo(() => {
    const list = [];
    if (data.topDegrees && data.topDegrees.length > 0) {
      list.push(...data.topDegrees.slice(0, 2));
    }
    if (data.alternativeDegrees && data.alternativeDegrees.length > 0) {
      list.push(...data.alternativeDegrees.slice(0, 2));
    }
    while (list.length < 4) {
      list.push({
        title: "Exploring Pathways",
        why: "Shortlist other interesting adjacent domains with your counsellor.",
        insight: "",
        match: 75
      });
    }
    return list.slice(0, 4);
  }, [data.topDegrees, data.alternativeDegrees]);

  // Fetch Core Strengths items from real assessment stats
  const strengths = useMemo(() => {
    const list: Array<{ title: string; desc: string; icon: "bulb" | "rocket" | "group" | "compass" }> = [];
    
    // Strength 01
    const s0 = data.stats.find((s) => s.key === "strength-0");
    if (s0) {
      list.push({ title: `Strength: ${s0.value}`, desc: s0.detail, icon: "bulb" });
    }
    // Strength 02
    const s1 = data.stats.find((s) => s.key === "strength-1");
    if (s1) {
      list.push({ title: `Strength: ${s1.value}`, desc: s1.detail, icon: "rocket" });
    }
    // Strength 03
    const s2 = data.stats.find((s) => s.key === "strength-2");
    if (s2) {
      list.push({ title: `Strength: ${s2.value}`, desc: s2.detail, icon: "group" });
    }
    // Hidden Talent or Best Team Role
    const talent = data.stats.find((s) => s.key === "hidden-talent");
    if (talent) {
      list.push({ title: `Hidden Talent: ${talent.value}`, desc: talent.detail, icon: "compass" });
    } else {
      const teamRole = data.stats.find((s) => s.key === "team-role");
      if (teamRole) {
        list.push({ title: `Team Role: ${teamRole.value}`, desc: teamRole.detail, icon: "compass" });
      }
    }
    
    return list;
  }, [data.stats]);

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-6 pb-20 mt-8">
      {/* Printable Sheet Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-6 md:p-12 text-ink"
      >
        {/* Header Block */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="flex items-center gap-2.5">
            <Logo className="size-7 text-[#6e6ef0]" />
            <span className="text-[24px] font-black tracking-tight text-ink font-sans">
              SecureSteps
            </span>
          </div>
          <div className="flex items-center gap-4 pl-4 border-l border-line/60">
            <div className="text-right">
              <div className="text-[11px] font-bold text-ink-700 tracking-wider">
                Your SecureSteps Report
              </div>
              <div className="text-[10px] text-ink-300 font-mono mt-0.5">
                Generated on: {todayStr}
              </div>
            </div>
          </div>
        </header>

        {/* Pathway Insight Title & Profile Card Grid */}
        <section className="grid md:grid-cols-[1.2fr,1fr] gap-8 py-8 items-start">
          <div className="space-y-4">
            <h1 className="text-[32px] sm:text-[40px] font-black leading-tight text-ink uppercase tracking-tight">
              YOUR PERSONAL PATHWAY INSIGHT
            </h1>
            <div className="text-[15px] font-extrabold text-[#6e6ef0] tracking-wider uppercase font-mono">
              Archetype: {data.archetype.name}
            </div>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-ink-500 max-w-md">
              This is you — decoded. Your answers reveal your natural strengths, what drives you, and the paths that will help you thrive.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="rounded-[18px] p-6 border border-line bg-[#f8f7fd]/40 flex gap-4 items-center">
            <div className="size-14 rounded-full bg-[#0a0e1a] text-white flex items-center justify-center font-mono text-[18px] font-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div>
                <h3 className="text-[17px] font-extrabold text-ink leading-tight truncate">
                  {data.profile.name}
                </h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono">
                  <Calendar className="size-3.5" />
                  <span>Profile ID: {profileId}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono">
                  <Target className="size-3.5" />
                  <span>Assessment Type: SecureSteps Discovery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strengths & Radar Fit Score Section */}
        <section className="grid md:grid-cols-2 gap-10 py-6 border-t border-line/50">
          {/* Left: Core Strengths */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                <Star className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
                YOUR CORE STRENGTHS
              </h2>
            </div>

            <div className="space-y-3">
              {strengths.map((str, idx) => {
                const IconComponent = STRENGTH_ICONS[str.icon];
                return (
                  <div
                    key={idx}
                    className="rounded-[14px] p-4 border border-line/40 bg-[#fbfaff]/60 hover:bg-[#fbfaff] transition-all flex gap-3.5 items-start"
                  >
                    <div className="size-8 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0] shrink-0 mt-0.5">
                      <IconComponent className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-ink-700">
                        {str.title}
                      </h4>
                      <p className="text-[12px] text-ink-500 leading-relaxed mt-1">
                        {str.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Path Fit Radar Chart */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="flex flex-col gap-1.5 self-start">
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                  <TrendingUp className="size-3.5" strokeWidth={3} />
                </div>
                <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
                  YOUR PATH FIT SCORE
                </h2>
              </div>
              <div className="text-[11px] font-extrabold text-[#6e6ef0] tracking-wider uppercase font-mono pl-8.5">
                {data.archetype.name} PATHWAY
              </div>
            </div>

            {/* Hexagon Radar Container */}
            <div className="relative w-full max-w-[360px] h-[320px] flex items-center justify-center mt-2 shrink-0">
              <DashboardRadarChart
                analytical={scores.analytical}
                creative={scores.creative}
                leadership={scores.leadership}
                peopleSkills={scores.peopleSkills}
                practical={scores.practical}
                entrepreneurial={scores.entrepreneurial}
              />

              {/* Top Center: Analytical */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Brain className="size-3.5 text-[#6e6ef0]" />
                  <span>Analytical</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5">{scores.analytical.toFixed(1)}/10</span>
              </div>

              {/* Top Right: Creative */}
              <div className="absolute top-[20%] right-0 flex flex-col items-start">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Palette className="size-3.5 text-[#6e6ef0]" />
                  <span>Creative</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pl-4">{scores.creative.toFixed(1)}/10</span>
              </div>

              {/* Bottom Right: Leadership */}
              <div className="absolute bottom-[20%] right-0 flex flex-col items-start">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <UserCheck className="size-3.5 text-[#6e6ef0]" />
                  <span>Leadership</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pl-4">{scores.leadership.toFixed(1)}/10</span>
              </div>

              {/* Bottom Center: People Skills */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Users className="size-3.5 text-[#6e6ef0]" />
                  <span>People Skills</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5">{scores.peopleSkills.toFixed(1)}/10</span>
              </div>

              {/* Bottom Left: Practical */}
              <div className="absolute bottom-[20%] left-0 flex flex-col items-end">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Settings className="size-3.5 text-[#6e6ef0]" />
                  <span>Practical</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pr-4">{scores.practical.toFixed(1)}/10</span>
              </div>

              {/* Top Left: Entrepreneurial */}
              <div className="absolute top-[20%] left-0 flex flex-col items-end">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Rocket className="size-3.5 text-[#6e6ef0]" />
                  <span>Entrepreneurial</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pr-4">{scores.entrepreneurial.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </section>

        {/* Best Path Matches Section */}
        <section className="py-6 border-t border-line/50 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
              <Award className="size-3.5" strokeWidth={3} />
            </div>
            <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
              BEST PATH MATCHES FOR YOU
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {bestMatches.map((match, idx) => {
              const MatchIcon = getMatchIcon(match.title);
              return (
                <div
                  key={idx}
                  className="rounded-[16px] p-5 border border-line bg-[#f8f7fd]/30 hover:bg-[#f8f7fd]/60 transition-all space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="size-6 rounded-full bg-[#6e6ef0] text-white font-mono text-[11px] font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {match.match && (
                          <span className="text-[9px] font-mono font-black text-[#6e6ef0] bg-[#f3f0fc] px-2 py-0.5 rounded-md">
                            {match.match}% FIT
                          </span>
                        )}
                        <div className="size-8 rounded-xl bg-white border border-line flex items-center justify-center text-[#6e6ef0] shrink-0 shadow-sm">
                          <MatchIcon className="size-5" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[14.5px] font-extrabold text-ink-700 leading-snug">
                        {match.title}
                      </h4>
                      <p className="text-[12px] text-ink-500 leading-relaxed mt-2.5">
                        {match.why}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Growth Tips & Next Steps */}
        <section className="grid md:grid-cols-2 gap-10 py-6 border-t border-line/50">
          {/* Left: Growth Tips */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#e8f8ef] flex items-center justify-center text-green-600">
                <Leaf className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
                GROWTH TIPS FOR YOU
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[13px] text-ink-600 leading-relaxed">
                  <strong className="text-ink-700">Focus Your Energy:</strong> Pick a direction and go deep. Consistency &gt; perfection.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[13px] text-ink-600 leading-relaxed">
                  <strong className="text-ink-700">Build Real-World Skills:</strong> Projects, internships and exposure will set you apart.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[13px] text-ink-600 leading-relaxed">
                  <strong className="text-ink-700">Trust Your Voice:</strong> You have strong ideas. Share them more and lead with confidence.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Next Steps */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#eef3fe] flex items-center justify-center text-blue-600">
                <Send className="size-3" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
                YOUR NEXT STEPS
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3.5 items-start">
                <span className="size-5 rounded-full bg-blue-600 text-white font-mono text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[13.5px] text-ink-600 font-medium leading-relaxed">
                  Explore these paths in detail with our 1:1 counselling.
                </p>
              </div>
              <div className="flex gap-3.5 items-start">
                <span className="size-5 rounded-full bg-blue-600 text-white font-mono text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[13.5px] text-ink-600 font-medium leading-relaxed">
                  Shortlist colleges & courses that fit your profile.
                </p>
              </div>
              <div className="flex gap-3.5 items-start">
                <span className="size-5 rounded-full bg-blue-600 text-white font-mono text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-[13.5px] text-ink-600 font-medium leading-relaxed">
                  Build your roadmap and start early.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Center Quote Block */}
        <section className="py-6 border-t border-line/50 flex flex-col items-center text-center space-y-2">
          <Quote className="size-6 text-[#6e6ef0]/30 transform rotate-180" />
          <p className="text-[15px] sm:text-[16px] font-extrabold italic text-ink-600 leading-relaxed max-w-lg">
            You don't need to have it all figured out. You just need the right direction.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-line/60 flex items-center justify-between text-ink-300 flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Logo className="size-5 text-[#6e6ef0]" />
            <span className="font-bold text-[13px] font-sans text-ink-400">
              SecureSteps
            </span>
          </div>
          <div className="text-[12.5px] text-ink-500 font-medium">
            If you want more info, visit{" "}
            <a
              href="https://www.securesteps.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6e6ef0] hover:underline font-semibold"
            >
              https://www.securesteps.co.in/
            </a>
          </div>
          <div className="flex items-center gap-4 text-ink-400">
            <Globe className="size-4 hover:text-[#6e6ef0] transition-colors cursor-pointer" />
            <Instagram className="size-4 hover:text-[#6e6ef0] transition-colors cursor-pointer" />
            <Facebook className="size-4 hover:text-[#6e6ef0] transition-colors cursor-pointer" />
          </div>
        </footer>
      </motion.div>
    </article>
  );
}

// Dedicated Radar Chart drawing logic
function DashboardRadarChart({
  analytical,
  creative,
  leadership,
  peopleSkills,
  practical,
  entrepreneurial
}: {
  analytical: number;
  creative: number;
  leadership: number;
  peopleSkills: number;
  practical: number;
  entrepreneurial: number;
}) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = 6;
  const ringValues = [25, 50, 75, 100];
  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

  const point = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (v / 10) * radius; // score is out of 10
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const axesValues = [
    analytical,
    creative,
    leadership,
    peopleSkills,
    practical,
    entrepreneurial
  ];

  const polygonPoints = axesValues
    .map((v, i) => {
      const p = point(i, v);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] max-w-full h-auto">
      {/* Concentric rings */}
      {ringValues.map((rv) => {
        const r = (rv / 100) * radius;
        return (
          <polygon
            key={rv}
            points={[0, 1, 2, 3, 4, 5]
              .map((i) => {
                const a = angleFor(i);
                return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(110, 110, 240, 0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axes spokes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = angleFor(i);
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={px}
            y2={py}
            stroke="rgba(110, 110, 240, 0.12)"
            strokeWidth={1}
          />
        );
      })}

      {/* Filled polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(110, 110, 240, 0.14)"
        stroke="#6e6ef0"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {axesValues.map((v, i) => {
        const p = point(i, v);
        return (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#6e6ef0"
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}
