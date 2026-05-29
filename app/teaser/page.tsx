"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DIMENSION_LABELS, Dimension } from "@/lib/types";
import { ROUTES_BCA, ROUTES_BCA_ENGAGEMENT } from "@/lib/question-bank/routes-bca";

interface CloudProps {
  duration: number;
  delay: number;
  size: number;
  top: string;
  opacity: number;
  shape: "A" | "B" | "C";
  direction: "left" | "right";
}

const CLOUD_PATHS: Record<"A" | "B" | "C", string> = {
  A: "M20 35a12 12 0 0 1 10-18h4a16 16 0 0 1 30-4h4a14 14 0 0 1 12 22 14 14 0 0 1-14 14H30a10 10 0 0 1-10-14z",
  B: "M15 35a10 10 0 0 1 8-15h4a14 14 0 0 1 24-6h4a16 16 0 0 1 28 4h4a12 12 0 0 1 10 18a12 12 0 0 1-12 12H25a10 10 0 0 1-10-13z",
  C: "M20 30a10 10 0 0 1 8-14h2a12 12 0 0 1 20-2h2a10 10 0 0 1 8 16a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z",
};

const CLOUD_HIGHLIGHTS: Record<"A" | "B" | "C", React.ReactNode> = {
  A: (
    <>
      <path d="M24 30a7 7 0 0 1 7-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 18a11 11 0 0 1 12-4" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M66 22a8 8 0 0 1 8 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  ),
  B: (
    <>
      <path d="M20 28a6 6 0 0 1 6-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M32 22a10 10 0 0 1 12-4" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M58 18a12 12 0 0 1 14-3" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </>
  ),
  C: (
    <>
      <path d="M22 26a6 6 0 0 1 6-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33 18a8 8 0 0 1 10-3" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  ),
};

function Cloud({ duration, delay, size, top, opacity, shape, direction }: CloudProps) {
  const isLeft = direction === "left";
  return (
    <motion.div
      initial={{ left: isLeft ? "-30%" : "120%" }}
      animate={{ left: isLeft ? "120%" : "-30%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute pointer-events-none select-none hidden md:block"
      style={{
        top,
        opacity,
        width: size,
      }}
    >
      <svg
        viewBox="0 0 100 60"
        className="w-full h-auto"
        style={{
          filter: "drop-shadow(0 6px 12px rgba(150, 130, 190, 0.12))"
        }}
      >
        <defs>
          <linearGradient id={`grad-teaser-${shape}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eae3f5" />
          </linearGradient>
        </defs>
        {/* Sticker offset shadow layer */}
        <path
          d={CLOUD_PATHS[shape]}
          fill="#dcd6e8"
          transform="translate(0, 3)"
        />
        {/* Main cloud body with 3D gradient fill */}
        <path
          d={CLOUD_PATHS[shape]}
          fill={`url(#grad-teaser-${shape})`}
          stroke="#beb5d0"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Volumetric gloss highlights */}
        {CLOUD_HIGHLIGHTS[shape]}
      </svg>
    </motion.div>
  );
}

function CircularProgress({ percentage, size = 96, strokeWidth = 7.5 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90 shrink-0"
      >
        {/* Background track circle */}
        <circle
          stroke="rgba(110, 110, 240, 0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Animated fill progress circle */}
        <motion.circle
          stroke="#6e6ef0"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      {/* Centered text inside the circle */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[11px] font-black tracking-tight text-ink leading-none">
          ALMOST
        </span>
        <span className="mono-eyebrow text-[7.5px] text-ink-400 mt-0.5 font-bold uppercase tracking-wider">
          THERE
        </span>
      </div>
    </div>
  );
}

export default function TeaserPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const archetype = useAssessment((s) => s.archetype);
  const profile = useAssessment((s) => s.profile);
  const setTrunk = useAssessment((s) => s.setTrunk);
  const trunkIds = useAssessment((s) => s.trunk);
  const setSection = useAssessment((s) => s.setSection);
  const computeArchetype = useAssessment((s) => s.computeArchetype);

  useEffect(() => {
    if (hydrated && profile && !archetype) computeArchetype();
  }, [hydrated, profile, archetype, computeArchetype]);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile || !archetype) return null;

  const top3 = [...archetype.scores]
    .sort((a, b) => Math.abs(b.normalized) - Math.abs(a.normalized))
    .slice(0, 3);

  const handleContinue = () => {
    const firstRouteId = ROUTES_BCA[0].id;
    const merged = [...trunkIds];
    if (!merged.includes(firstRouteId)) {
      merged.push(firstRouteId);
    }
    setTrunk(merged);
    setSection("routes");
    router.push("/assessment");
  };

  return (
    <main
      className="min-h-dvh relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 12% 15%, rgba(244, 184, 212, 0.22), transparent 30%),
          radial-gradient(circle at 88% 25%, rgba(196, 181, 253, 0.2), transparent 28%),
          radial-gradient(circle at 30% 75%, rgba(186, 230, 253, 0.16), transparent 32%),
          radial-gradient(circle at 75% 85%, rgba(254, 243, 199, 0.18), transparent 32%),
          linear-gradient(
            135deg,
            #f8eef2 0%,
            #f1edf6 45%,
            #eef3f9 100%
          )
        `,
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[-6%] h-[500px] w-[500px] rounded-full bg-pink-300/18 blur-[130px]" />
        <div className="absolute top-[25%] right-[-8%] h-[480px] w-[480px] rounded-full bg-violet-300/16 blur-[130px]" />
        <div className="absolute bottom-[20%] left-[-4%] h-[450px] w-[450px] rounded-full bg-blue-200/14 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[380px] w-[380px] rounded-full bg-amber-200/12 blur-[100px]" />

        {/* Floating background clouds */}
        <Cloud shape="A" direction="left" size={280} top="8%" duration={85} delay={0} opacity={0.75} />
        <Cloud shape="B" direction="left" size={380} top="42%" duration={110} delay={-35} opacity={0.65} />
        <Cloud shape="C" direction="right" size={240} top="22%" duration={90} delay={-15} opacity={0.7} />
        <Cloud shape="A" direction="right" size={310} top="65%" duration={120} delay={-60} opacity={0.65} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8"
        >
          <span className="active-dot" />
          <span className="mono-eyebrow text-electric">HALFWAY · ARCHETYPE REVEAL</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="display-xl text-[28px] sm:text-[42px] md:text-[76px] lg:text-[88px] text-ink leading-tight"
        >
          {archetype.name.replace(/^The\s/, "").toUpperCase()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="display-md text-[17px] sm:text-[20px] md:text-[22px] text-ink-500 mt-3"
        >
          {archetype.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="panel mt-8 sm:mt-12 p-5 sm:p-7 md:p-9"
        >
          <div className="mono-eyebrow text-ink-300 mb-5">CORE READING</div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,110px] gap-4 sm:gap-6 items-center">
            <div>
              <p className="text-[14px] sm:text-[16px] leading-relaxed text-ink-500 text-balance">
                {archetype.description}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-center justify-center shrink-0">
              <CircularProgress percentage={50} size={96} strokeWidth={7.5} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="panel mt-6 sm:mt-10 p-5 sm:p-7 md:p-9"
        >
          <div className="mono-eyebrow text-ink-300 mb-4">TOP DIMENSIONS</div>
          <div className="grid gap-3">
            {top3.map((s) => (
              <DimensionRow key={s.dimension} dimension={s.dimension} value={s.normalized} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-14 flex flex-col items-start gap-3"
        >
          <Button variant="solid" onClick={handleContinue} className="px-8 py-4">
            Continue to Routes
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <p className="mono-eyebrow text-ink-300 max-w-md">
            ROUTES SHOWS HOW THIS LANDS IN YOUR FIELD · ~9 MIN
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function DimensionRow({ dimension, value }: { dimension: Dimension; value: number }) {
  const meta = DIMENSION_LABELS[dimension];
  const polarLabel = value >= 0 ? meta.high : meta.low;
  const intensity = Math.abs(value);
  return (
    <div className="panel-subtle px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0 shrink">
        <div className="mono-eyebrow text-ink-300 text-[10px] sm:text-[11px]">{meta.label.toUpperCase()}</div>
        <div className="display-md text-[16px] sm:text-[18px] text-ink mt-0.5 sm:mt-1">{polarLabel}</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="h-1 w-16 sm:w-32 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-electric" style={{ width: `${Math.min(100, intensity)}%` }} />
        </div>
        <span className="font-mono text-[11px] sm:text-[12px] text-ink-400 w-8 sm:w-10 text-right">
          {value > 0 ? "+" : ""}{value}
        </span>
      </div>
    </div>
  );
}
