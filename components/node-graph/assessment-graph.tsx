"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Question, Answer, Section } from "@/lib/types";
import { TrunkChip } from "./trunk-chip";
import { QuestionCard } from "./question-card";
import { cn } from "@/lib/utils";

interface Props {
  trunk: Question[];
  answers: Record<string, Answer>;
  activeId: string;
  onActivate: (id: string) => void;
  onAnswer: (partial: Partial<Answer>) => void;
  onNext: () => void;
  loadingNext?: boolean;
  positionLabel?: string;
}

const SECTION_META: Record<Section, { label: string; index: number }> = {
  context: { label: "CONTEXT", index: 1 },
  roots: { label: "ROOTS", index: 2 },
  teaser: { label: "ARCHETYPE", index: 3 },
  routes: { label: "ROUTES", index: 4 },
  report: { label: "REPORT", index: 5 },
};

export function AssessmentGraph({
  trunk,
  answers,
  activeId,
  onActivate,
  onAnswer,
  onNext,
  loadingNext,
  positionLabel,
}: Props) {
  const activeIndex = trunk.findIndex((q) => q.id === activeId);
  const active = trunk[activeIndex];
  const before = trunk.slice(0, activeIndex);

  const [historyOpen, setHistoryOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offscreen = rect.top < -80 || rect.top > window.innerHeight - 200;
    if (offscreen) {
      window.scrollTo({
        top: window.scrollY + rect.top - 60,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  if (!active) return null;

  return (
    <div className="relative w-full">
      {before.length > 0 && (
        <HistoryRail
          open={historyOpen}
          onToggle={() => setHistoryOpen((s) => !s)}
          items={before}
          answers={answers}
          onActivate={(id) => {
            setHistoryOpen(false);
            onActivate(id);
          }}
        />
      )}

      <section
        ref={stageRef}
        className="min-h-[88dvh] flex flex-col items-center justify-center px-4 py-12"
      >
        <SectionPin section={active.section} />
        <div className="w-full flex justify-center">
  <div className="relative w-full max-w-2xl">

    {/* Outside AnimatePresence — not clipped, not animated */}
    <img
      src="/animal-peek.png"
      alt="cat assistant"
      style={{ left: "-3.25rem", top: "-9rem" , width: "100%" }}
      className={cn(
      "absolute w-70 z-30 pointer-events-none select-none transition-opacity duration-300",
      loadingNext ? "opacity-0" : "opacity-100"
      )}    />

    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, x: 32, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -32, filter: "blur(4px)" }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 28,
          mass: 0.8,
          opacity: { duration: 0.25 },
          filter: { duration: 0.25 },
        }}
        className="w-full"
      >
        <QuestionCard
          question={active}
          answer={answers[active.id]}
          onAnswer={onAnswer}
          onNext={onNext}
          onAutoAdvance={onNext}
          loadingNext={loadingNext}
          positionLabel={positionLabel}
        />
      </motion.div>
    </AnimatePresence>
  </div>
</div>
      </section>
    </div>
  );
}

function HistoryRail({
  open,
  onToggle,
  items,
  answers,
  onActivate,
}: {
  open: boolean;
  onToggle: () => void;
  items: Question[];
  answers: Record<string, Answer>;
  onActivate: (id: string) => void;
}) {
  return (
    <div className="border-b border-line/60 bg-surface/80 backdrop-blur sticky top-[64px] z-20">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="mono-eyebrow text-ink-400 hover:text-ink flex items-center gap-2 transition-colors"
        >
          <span className="active-dot" />
          {items.length} ANSWERED · TAP TO {open ? "HIDE" : "REVIEW"}
          <ChevronUp className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-4 pb-4 space-y-2 max-h-[40dvh] overflow-y-auto scrollbar-thin">
              {items.map((q) => (
                <TrunkChip
                  key={q.id}
                  question={q}
                  answer={answers[q.id]}
                  onEdit={() => onActivate(q.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionPin({ section }: { section: Section }) {
  const meta = SECTION_META[section];
  return (
    <div className="flex items-center gap-3 mb-7">
      <span className="mono-eyebrow text-ink-300">STEP {meta.index} OF 5</span>
      <span className="h-px w-10 bg-line" />
      <span
        className={cn(
          "mono-eyebrow flex items-center gap-1.5",
          section === "context" || section === "roots" ? "text-ink" : "text-electric",
        )}
      >
        <span className="active-dot" />
        {meta.label}
      </span>
    </div>
  );
}