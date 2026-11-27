"use client";

// What surrounds a question during the test: the strip above the card that says which part the
// student is in, the page that opens a part, and at the foot of the page the numbers
// (done, left, minutes) with the Previous / Next row.

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEST_SECTIONS } from "@/lib/v2/test-sections";
import type { SectionProgress } from "@/lib/v2/test-sections";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A number or short text that rolls to its new value instead of jumping. */
function Ticker({ value, className }: { value: string; className?: string }) {
  const still = useReducedMotion();
  return (
    <span className={cn("relative inline-flex overflow-hidden align-bottom", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={still ? false : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={still ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="inline-block tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** One bar per part of the test, each as wide as its share of the questions. */
export function PartBars({ parts, current, className }: { parts: SectionProgress[]; current: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-hidden>
      {parts.map((p, i) => (
        <div
          key={i}
          style={{ flexGrow: Math.max(p.total, 1) }}
          className={cn(
            "h-1.5 basis-0 rounded-full overflow-hidden transition-colors duration-300",
            i === current ? "bg-electric/25" : "bg-ink/10",
          )}
        >
          <motion.div
            className="h-full rounded-full bg-electric"
            initial={false}
            animate={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
        </div>
      ))}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-white/70 bg-white/55 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="text-[17px] sm:text-[20px] font-bold leading-none text-ink">
        <Ticker value={value} />
      </div>
      <div className="mt-1 text-[10.5px] sm:text-[11.5px] leading-none text-ink-400 truncate">{label}</div>
    </div>
  );
}

/** The strip above the question card: which part this is, and how far along. */
export function StageHeader({
  section,
  category,
  index,
  total,
  parts,
}: {
  /** Index into TEST_SECTIONS. */
  section: number;
  /** The question's own label, e.g. "Go deeper". */
  category: string;
  /** 0-based position of the question on screen. */
  index: number;
  total: number;
  parts: SectionProgress[];
}) {
  return (
    <div
      className="space-y-2.5"
      role="group"
      aria-label={`Part ${section + 1} of ${TEST_SECTIONS.length}, ${category}. Question ${index + 1} of ${total}.`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="mono-eyebrow text-ink-700 flex items-center gap-2 min-w-0">
          <span className="active-dot shrink-0" />
          <span className="text-electric shrink-0">Part {section + 1} of {TEST_SECTIONS.length}</span>
          <span className="text-ink-300">·</span>
          <Ticker value={category} className="truncate" />
        </div>
        <div className="mono-eyebrow text-ink-400 shrink-0">
          <Ticker value={String(index + 1)} /> of {total}
        </div>
      </div>

      <PartBars parts={parts} current={section} />
    </div>
  );
}

/** The numbers at the foot of the page: how much is done, and how much is left. */
export function StageStats({
  index,
  total,
  minutes,
  compact,
}: {
  /** 0-based position of the question on screen. */
  index: number;
  total: number;
  minutes: number;
  /** One line of text instead of three tiles, for a question that would not otherwise fit the screen. */
  compact?: boolean;
}) {
  const percent = total ? Math.round((index / total) * 100) : 0;
  const left = total - index;
  if (compact) {
    return (
      <div
        data-stage-stats
        className="flex flex-wrap items-baseline justify-center gap-x-2 text-[12px] leading-none text-ink-400"
      >
        <span><b className="font-bold text-ink"><Ticker value={`${percent}%`} /></b> done</span>
        <span className="text-ink-300">·</span>
        <span><b className="font-bold text-ink"><Ticker value={String(left)} /></b> {left === 1 ? "question" : "questions"} left</span>
        <span className="text-ink-300">·</span>
        <span><b className="font-bold text-ink"><Ticker value={`${minutes} min`} /></b> at your pace</span>
      </div>
    );
  }
  return (
    <div data-stage-stats className="flex gap-2">
      <Metric value={`${percent}%`} label="done" />
      <Metric value={String(left)} label={left === 1 ? "question left" : "questions left"} />
      <Metric value={`${minutes} min`} label="left, at your pace" />
    </div>
  );
}

/** The page that opens a part of the test. */
export function SectionIntro({
  section,
  questions,
  minutes,
  parts,
  onContinue,
  onPrevious,
}: {
  section: number;
  /** Questions in this part. */
  questions: number;
  /** Rough minutes this part takes. */
  minutes: number;
  parts: SectionProgress[];
  onContinue: () => void;
  onPrevious?: () => void;
}) {
  const still = useReducedMotion();
  const { title, about } = TEST_SECTIONS[section];
  const rise = (delay: number) => ({
    initial: still ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: EASE },
  });
  return (
    <div className="panel relative w-full overflow-hidden p-6 sm:p-10 md:p-12">
      {/* A soft glow that breathes behind the part number. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-electric/15 blur-3xl"
        animate={still ? undefined : { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div {...rise(0)} className="mono-eyebrow text-electric relative">
        Part {section + 1} of {TEST_SECTIONS.length}
      </motion.div>

      <motion.div
        aria-hidden
        initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.05 }}
        className="relative mt-3 origin-left bg-gradient-to-br from-ink via-ink-700 to-electric bg-clip-text font-display text-[64px] sm:text-[88px] font-black leading-none tracking-tight text-transparent tabular-nums"
      >
        {String(section + 1).padStart(2, "0")}
      </motion.div>

      <motion.h2 {...rise(0.14)} className="display-md relative mt-3 text-[26px] sm:text-[36px] text-ink text-balance">
        {title}
      </motion.h2>
      <motion.p {...rise(0.2)} className="relative mt-2 max-w-xl text-[14.5px] sm:text-[16.5px] leading-relaxed text-ink-500">
        {about}
      </motion.p>

      <motion.div {...rise(0.28)} className="relative mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-electric-tint px-3 py-1.5 text-[12px] font-semibold text-electric">
          {questions} {questions === 1 ? "question" : "questions"}
        </span>
        <span className="rounded-full bg-electric-tint px-3 py-1.5 text-[12px] font-semibold text-electric">
          about {minutes} min
        </span>
      </motion.div>

      <motion.div {...rise(0.34)} className="relative mt-6">
        <PartBars parts={parts} current={section} />
      </motion.div>

      <motion.div {...rise(0.42)} className="relative mt-7 flex items-center justify-between gap-3">
        {onPrevious ? (
          <button type="button" onClick={onPrevious} className="btn-ghost">
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={onContinue} className="btn-solid" autoFocus>
          {section === 0 ? "Begin" : "Continue"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </div>
  );
}

/** Previous and Next, under the question card. */
export function StageNav({
  onPrevious,
  onNext,
  canNext,
  nextLabel = "Next",
}: {
  /** Left out on the very first question. */
  onPrevious?: () => void;
  /** Left out when the card above moves on by itself. */
  onNext?: () => void;
  canNext?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {onPrevious ? (
        <button type="button" onClick={onPrevious} className="btn-ghost">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button type="button" onClick={onNext} disabled={!canNext} className="btn-outline bg-white/60 backdrop-blur-md">
          {nextLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
