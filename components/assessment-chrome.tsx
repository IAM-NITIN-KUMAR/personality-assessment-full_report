"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

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
      initial={{ x: isLeft ? "-30vw" : "110vw" }}
      animate={{ x: isLeft ? "110vw" : "-30vw" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute pointer-events-none select-none hidden md:block"
      style={{
        top,
        left: 0,
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
          <linearGradient id={`grad-${shape}`} x1="0%" y1="0%" x2="0%" y2="100%">
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
          fill={`url(#grad-${shape})`}
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

function Header({
  name,
  sectionLabel,
  onReset,
}: {
  name: string;
  sectionLabel: string;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />

          <div>
            <div className="font-mono text-[13px] font-semibold tracking-wide leading-none uppercase">
              Roots <span className="text-ink-300">/</span> Routes
            </div>

            <div className="mono-eyebrow text-ink-300 mt-1.5">
              {sectionLabel} · {name.split(" ")[0]}
            </div>
          </div>
        </div>

        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="h-3 w-3" />
          Start over
        </Button>
      </div>
    </header>
  );
}

/** Shared assessment shell: pastel sky gradient, floating clouds, glass header. */
export function AssessmentChrome({
  name,
  sectionLabel,
  onReset,
  children,
}: {
  name: string;
  sectionLabel: string;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <main
      className="h-dvh flex flex-col overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at 10% 30%, rgba(244, 184, 212, 0.22), transparent 28%),
          radial-gradient(circle at 88% 18%, rgba(196, 181, 253, 0.18), transparent 26%),
          radial-gradient(circle at 72% 82%, rgba(186, 230, 253, 0.14), transparent 28%),
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
        <div className="absolute top-[8%] left-[-4%] h-[420px] w-[420px] rounded-full bg-pink-300/18 blur-[120px]" />

        <div className="absolute top-[12%] right-[-6%] h-[380px] w-[380px] rounded-full bg-violet-300/16 blur-[120px]" />

        <div className="absolute bottom-[-8%] right-[18%] h-[340px] w-[340px] rounded-full bg-blue-200/14 blur-[110px]" />

        <div className="absolute top-[38%] left-[42%] h-[180px] w-[180px] rounded-full bg-fuchsia-200/10 blur-[90px]" />

        {/* Floating background clouds */}
        {/* Left to Right */}
        <Cloud shape="A" direction="left" size={280} top="12%" duration={75} delay={0} opacity={0.8} />
        <Cloud shape="B" direction="left" size={380} top="38%" duration={95} delay={-25} opacity={0.65} />
        <Cloud shape="C" direction="left" size={200} top="68%" duration={65} delay={-45} opacity={0.75} />

        {/* Right to Left */}
        <Cloud shape="B" direction="right" size={340} top="22%" duration={110} delay={-12} opacity={0.65} />
        <Cloud shape="A" direction="right" size={300} top="52%" duration={85} delay={-30} opacity={0.7} />
        <Cloud shape="C" direction="right" size={180} top="80%" duration={60} delay={-15} opacity={0.8} />
      </div>

      <Header name={name} sectionLabel={sectionLabel} onReset={onReset} />

      {children}
    </main>
  );
}
