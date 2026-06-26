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
import { DISCIPLINES, courseById } from "@/lib/course-catalog";

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

  const disciplineLabel = useMemo(() => {
    const disc = DISCIPLINES.find((d) => d.id === data.profile.discipline);
    return disc ? disc.label : data.profile.discipline;
  }, [data.profile.discipline]);

  const chosenCourse = useMemo(() => {
    return courseById(data.profile.course);
  }, [data.profile.course]);

  const introMessage = useMemo(() => {
    if (data.profile.discipline === "schooling") {
      return (
        <span className="inline-block mt-2 text-[13px] font-medium leading-relaxed bg-[#f3f0fc] text-[#6e6ef0] rounded-xl px-4 py-2.5 border border-[#6e6ef0]/15 shadow-sm">
          👋 It's wonderful to know you are currently in <strong>Schooling</strong>! This is a unique phase of pure potential where you can build strong foundations. We'll help you pinpoint the best undergraduate routes matching your style.
        </span>
      );
    }

    if (chosenCourse) {
      return (
        <span className="inline-block mt-2 text-[13px] font-medium leading-relaxed bg-[#f3f0fc] text-[#6e6ef0] rounded-xl px-4 py-2.5 border border-[#6e6ef0]/15 shadow-sm">
          🎯 It's fantastic to know you are focusing on the <strong>{disciplineLabel}</strong> stream, with your sights set on <strong>{chosenCourse.title}</strong>! Let's explore how this matches your cognitive DNA and what similar pathways might expand your horizon.
        </span>
      );
    }

    return (
      <span className="inline-block mt-2 text-[13px] font-medium leading-relaxed bg-[#f3f0fc] text-[#6e6ef0] rounded-xl px-4 py-2.5 border border-[#6e6ef0]/15 shadow-sm">
        ✨ It's great to know you are focusing on the <strong>{disciplineLabel}</strong> stream! Let's explore the best matching specializations and pathways that align with your unique archetype.
      </span>
    );
  }, [data.profile.discipline, disciplineLabel, chosenCourse]);

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

  const topEnvironments = useMemo(() => {
    const sorted = [...data.environmentFit].sort((a, b) => b.score - a.score).slice(0, 3);
    const colors = ["#10b981", "#6e6ef0", "#0ea5e9"]; // green, brand-purple, cyan
    return sorted.map((env, idx) => ({
      label: env.key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      score: env.score,
      color: colors[idx % colors.length]
    }));
  }, [data.environmentFit]);

  const careerChartData = useMemo(() => {
    const colors = ["#6e6ef0", "#f3a6d9", "#3b82f6", "#10b981"]; // brand purple, brand pink, blue, green
    return data.commonCareerPaths.map((path, idx) => ({
      label: path.role,
      percentage: path.percentage,
      color: colors[idx % colors.length]
    }));
  }, [data.commonCareerPaths]);


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
    <article className="max-w-4xl mx-auto px-3 sm:px-6 pb-20 mt-4 sm:mt-8 space-y-8">
      {/* PAGE 1: Personal Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-[#f3f0fc] text-[#6e6ef0] font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] z-10 border-b border-l border-line/50 shadow-sm">
          PAGE 1 OF 3
        </div>
        {/* Header Block */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="flex items-center gap-2.5">
            <Logo className="size-7 text-[#6e6ef0]" />
            <span className="text-[24px] font-black tracking-tight text-ink font-sans">
              SecureSteps
            </span>
          </div>
          <div className="flex items-center gap-4 pl-0 sm:pl-4 border-l-0 sm:border-l border-line/60">
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
            {introMessage}
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
            <div className="relative w-full max-w-[290px] sm:max-w-[360px] h-[260px] sm:h-[320px] flex items-center justify-center mt-2 shrink-0">
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
              <div className="absolute top-[18%] -right-2 sm:right-0 flex flex-col items-start">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Palette className="size-3.5 text-[#6e6ef0]" />
                  <span>Creative</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pl-4">{scores.creative.toFixed(1)}/10</span>
              </div>

              {/* Bottom Right: Leadership */}
              <div className="absolute bottom-[18%] -right-2 sm:right-0 flex flex-col items-start">
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
              <div className="absolute bottom-[18%] -left-2 sm:left-0 flex flex-col items-end">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Settings className="size-3.5 text-[#6e6ef0]" />
                  <span>Practical</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pr-4">{scores.practical.toFixed(1)}/10</span>
              </div>

              {/* Top Left: Entrepreneurial */}
              <div className="absolute top-[18%] -left-2 sm:left-0 flex flex-col items-end">
                <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-ink-700">
                  <Rocket className="size-3.5 text-[#6e6ef0]" />
                  <span>Entrepreneurial</span>
                </div>
                <span className="font-mono text-[9px] text-ink-400 font-bold mt-0.5 pr-4">{scores.entrepreneurial.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Drivers */}
        <section className="py-6 border-t border-line/50 space-y-6 mt-6">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
              <Compass className="size-3.5" strokeWidth={3} />
            </div>
            <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
              KEY DRIVERS
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.drivers.map((driver, idx) => (
              <div key={idx} className="rounded-[14px] p-4 border border-line bg-[#fbfaff]/60 shadow-sm space-y-2">
                <div className="text-[10px] font-bold text-ink-400 font-mono uppercase">{driver.category}</div>
                <h4 className="text-[14px] font-extrabold text-[#6e6ef0]">{driver.label}</h4>
                <p className="text-[12px] text-ink-600 leading-relaxed">{driver.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Preferences & Aptitudes */}
        <section className="grid md:grid-cols-2 gap-10 py-6 border-t border-line/50 mt-2">
          <div className="space-y-6">
             <div className="flex items-center gap-2.5">
               <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                 <Briefcase className="size-3.5" strokeWidth={3} />
               </div>
               <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">TOP PREFERENCES</h2>
             </div>
             <div className="space-y-4">
               {[...data.workPreferences].sort((a,b) => b.score - a.score).slice(0,3).map((pref, idx) => (
                 <div key={idx} className="space-y-1.5">
                   <div className="flex justify-between text-[13px] font-bold text-ink-700">
                     <span>{pref.label}</span>
                     <span className="text-ink-400 font-mono text-[11px]">{pref.level}</span>
                   </div>
                   <div className="h-1.5 w-full bg-line/50 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: `${pref.score}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: 0.1 * idx, ease: "easeOut" }}
                       className="h-full bg-[#6e6ef0] rounded-full" 
                     />
                   </div>
                   <p className="text-[11.5px] text-ink-500">{pref.detail}</p>
                 </div>
               ))}
             </div>
          </div>
          <div className="space-y-6">
             <div className="flex items-center gap-2.5">
               <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                 <Star className="size-3.5" strokeWidth={3} />
               </div>
               <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">TOP APTITUDES</h2>
             </div>
             <div className="space-y-4">
               {[...data.workAptitudes].sort((a,b) => b.score - a.score).slice(0,3).map((apt, idx) => (
                 <div key={idx} className="space-y-1.5">
                   <div className="flex justify-between text-[13px] font-bold text-ink-700">
                     <span>{apt.label}</span>
                     <span className="text-ink-400 font-mono text-[11px]">{apt.score}/100</span>
                   </div>
                   <div className="h-1.5 w-full bg-line/50 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: `${apt.score}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: 0.1 * idx, ease: "easeOut" }}
                       className="h-full bg-[#6e6ef0] rounded-full" 
                     />
                   </div>
                   <p className="text-[11.5px] text-ink-500">{apt.detail}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Career Traits (Deep Dive Bi-Directional Scales) */}
        <section className="py-6 border-t border-line/50 space-y-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
              <LineChart className="size-3.5" strokeWidth={3} />
            </div>
            <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
              CAREER TRAITS ANALYSIS
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {data.careerTraits.map((group, gIdx) => (
              <div key={gIdx} className="space-y-4">
                <h3 className="text-[11px] font-black tracking-widest text-ink-400 uppercase border-b border-line pb-2">{group.category}</h3>
                <div className="space-y-3">
                  {group.traits.map((trait, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-3.5 rounded-xl border border-line/50 bg-[#fbfaff]/50 hover:bg-[#fbfaff] transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-ink-700">
                          {trait.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-500 leading-relaxed">
                        {trait.score > 50 ? trait.highLabel : trait.lowLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
        <div className="absolute top-0 right-0 bg-[#f3f0fc] text-[#6e6ef0] font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] z-10 border-b border-l border-line/50 shadow-sm">
          PAGE 2 OF 3
        </div>

        {/* Best Path Matches Section */}
        <section className="py-6 space-y-6">
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

        {/* Alternative Paths */}
        {data.alternativeDegrees.length > 0 && (
          <section className="py-6 border-t border-line/50 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                <Globe className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
                ALTERNATIVE PATHWAYS
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {data.alternativeDegrees.map((match, idx) => {
                const MatchIcon = getMatchIcon(match.title);
                return (
                  <div key={idx} className="rounded-[16px] p-5 border border-line bg-[#f8f7fd]/30 hover:bg-[#f8f7fd]/60 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-xl bg-white border border-line flex items-center justify-center text-[#6e6ef0] shadow-sm">
                        <MatchIcon className="size-4" />
                      </div>
                      <span className="text-[9px] font-mono font-black text-ink-500 bg-line/50 px-2 py-0.5 rounded-md">
                        {match.match}% FIT
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-ink-700 leading-snug">{match.title}</h4>
                      <p className="text-[11.5px] text-ink-500 leading-relaxed mt-1.5">{match.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Environment & Career Distribution */}
        <section className="grid md:grid-cols-2 gap-10 py-6 border-t border-line/50">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                <Settings className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">IDEAL ENVIRONMENT</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[12px] text-ink-500 mb-2">Concentric rings showing your top environment fits:</p>
              <ConcentricRingsChart items={topEnvironments} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
                <Users className="size-3.5" strokeWidth={3} />
              </div>
              <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">CAREER DISTRIBUTION</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[12px] text-ink-500 mb-2">Role breakdown for {data.archetype.name}s in this field:</p>
              <DonutChart items={careerChartData} />
            </div>
          </div>
        </section>
      </motion.div>

      {/* PAGE 3: NEXT Secure Step */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-[#f3f0fc] text-[#6e6ef0] font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] z-10 border-b border-l border-line/50 shadow-sm">
          PAGE 3 OF 3
        </div>

        {/* Shared Interests */}
        <section className="py-6 border-b border-line/50 space-y-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
              <Lightbulb className="size-3.5" strokeWidth={3} />
            </div>
            <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
              SHARED INTERESTS
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.sharedInterests.map((interest, idx) => (
              <div key={idx} className="px-3 py-1.5 bg-[#f8f7fd] border border-line/60 rounded-lg text-[12px] font-medium text-ink-600">
                {interest}
              </div>
            ))}
          </div>
        </section>

        {/* Growth Tips & Next Steps */}
        <section className="grid md:grid-cols-2 gap-10 py-6">
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

        {/* Parent Letter */}
        <section className="py-6 border-t border-line/50 space-y-5 mt-6">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-full bg-[#f3f0fc] flex items-center justify-center text-[#6e6ef0]">
              <Quote className="size-3.5" strokeWidth={3} />
            </div>
            <h2 className="text-[13px] font-black tracking-widest text-ink-700 uppercase">
              A NOTE FOR YOUR FAMILY
            </h2>
          </div>
          <div className="rounded-[18px] p-6 sm:p-8 border border-line bg-[#f8f7fd]/40 space-y-4 max-w-3xl mx-auto">
            <h3 className="text-[16px] font-bold text-ink-800 border-b border-line/50 pb-2">
              {data.parentLetter.greeting}
            </h3>
            {data.parentLetter.paragraphs.map((para, idx) => (
              <p key={idx} className="text-[13.5px] leading-relaxed text-[#3a3d48]">
                {para}
              </p>
            ))}
            <div className="pt-4 border-t border-line/50 text-[12px] text-ink-400 font-mono leading-relaxed">
              {data.parentLetter.signoff.split("\n").map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
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
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[140px] h-[140px] sm:w-[220px] sm:h-[220px] max-w-full h-auto">
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

// Concentric progress rings for Ideal Environment
function ConcentricRingsChart({
  items
}: {
  items: Array<{ label: string; score: number; color: string }>
}) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 8;
  const gap = 5;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-line bg-[#fbfaff]/50 w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] shrink-0">
        {items.map((item, idx) => {
          const r = 25 + idx * (strokeWidth + gap);
          const circumference = 2 * Math.PI * r;
          const strokeDashoffset = circumference * (1 - item.score / 100);
          return (
            <g key={idx}>
              {/* Background ring */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(229, 231, 235, 0.4)"
                strokeWidth={strokeWidth}
              />
              {/* Filled ring */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </g>
          );
        })}
      </svg>
      <div className="flex-1 space-y-2.5 w-full min-w-0">
        {items.slice().reverse().map((item, idx) => (
          <div key={idx} className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[12px] min-w-0">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex-1 flex justify-between font-bold text-ink-700 min-w-0">
                <span className="truncate pr-2">{item.label}</span>
                <span className="font-mono text-ink-400 pl-1 shrink-0">{item.score}%</span>
              </div>
            </div>
            {/* Tiny progress line to make it look even more interesting */}
            <div className="h-1 w-full bg-line/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut chart for Career Distribution
function DonutChart({
  items
}: {
  items: Array<{ label: string; percentage: number; color: string }>
}) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 48;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  let accumPercentage = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-line bg-[#fbfaff]/50 w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] shrink-0">
        {items.map((item, idx) => {
          const fraction = item.percentage / 100;
          const strokeDasharray = `${circumference * fraction} ${circumference * (1 - fraction)}`;
          const strokeDashoffset = circumference * -accumPercentage;
          accumPercentage += fraction;

          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="white" />
      </svg>
      <div className="flex-1 space-y-2.5 w-full min-w-0">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[12px] min-w-0">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex-1 flex justify-between font-bold text-ink-700 min-w-0">
                <span className="truncate pr-2">{item.label}</span>
                <span className="font-mono text-ink-400 pl-1 shrink-0">{item.percentage}%</span>
              </div>
            </div>
            <div className="h-1 w-full bg-line/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

