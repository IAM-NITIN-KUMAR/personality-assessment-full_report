"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Question, Answer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  answer?: Answer;
  onAnswer: (partial: Partial<Answer>) => void;
  onNext: () => void;
  /** Called after a single_choice option is selected, to auto-advance. */
  onAutoAdvance?: () => void;
  loadingNext?: boolean;
  positionLabel?: string;
}

const AUTO_ADVANCE_DELAY = 420;

export function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onAutoAdvance,
  loadingNext,
  positionLabel,
}: Props) {
  const canAdvance = isAnswered(question, answer);
  const showManualNext = question.type === "short_text" || question.type === "multi_choice";

  const advancedRef = useRef(false);
  const advanceTimeoutRef = useRef<number | null>(null);

  const handleSelect = (optionIds: string[]) => {
    onAnswer({ optionIds });
    if (optionIds.length === 0 || !onAutoAdvance) return;

    if (question.type === "single_choice") {
      if (advancedRef.current) return;
      advancedRef.current = true;
      advanceTimeoutRef.current = window.setTimeout(() => {
        onAutoAdvance();
        advanceTimeoutRef.current = null;
      }, AUTO_ADVANCE_DELAY);
      return;
    }
  };

  const handleNextClick = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    onNext();
  };

  useEffect(() => {
    advancedRef.current = false;
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, [question.id]);

  return (
    <div className="panel relative w-full p-5 sm:p-8 md:p-12">
      <CornerMotif kind={question.kind} />

      <div className="mb-4 sm:mb-7 relative">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="active-dot" />
          <span className="mono-eyebrow text-ink-700">{question.category}</span>
          {question.kind === "adaptive" && (
            <span className="inline-flex items-center gap-1 mono-eyebrow text-electric">
              <Sparkles className="h-3 w-3" />
              ADAPTIVE
            </span>
          )}
        </div>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          {positionLabel && (
            <div className="mono-eyebrow text-ink-300">{positionLabel}</div>
          )}
        </div>
      </div>

      <motion.h2
        key={question.prompt}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="display-md text-[18px] sm:text-[26px] md:text-[34px] lg:text-[40px] text-ink mb-1.5 sm:mb-2 text-balance leading-tight"
      >
        {question.prompt}
      </motion.h2>
      {question.hint && (
        <p className="text-[14px] sm:text-[16px] text-ink-400 mb-4 sm:mb-6">{question.hint}</p>
      )}

      <div className="mt-6">
        <QuestionBody
          question={question}
          answer={answer}
          onAnswer={handleSelect}
          onAnswerText={(text) => onAnswer({ text })}
        />
      </div>

      {showManualNext && (
        <div className="flex items-center justify-end mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-line/70">
          <Button variant="outline" onClick={handleNextClick} disabled={!canAdvance || loadingNext}>
            {loadingNext ? "…" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function isAnswered(q: Question, a?: Answer): boolean {
  if (!a) return false;
  if (q.type === "short_text") return !!a.text && a.text.trim().length > 0;
  return !!a.optionIds && a.optionIds.length > 0;
}

function CornerMotif({ kind }: { kind: string }) {
  return (
    <div className="absolute top-7 right-7 pointer-events-none">
      <div
        className={cn(
          "size-7 rounded-full",
          kind === "adaptive"
            ? "bg-gradient-to-br from-electric/80 to-electric"
            : "bg-gradient-to-br from-ink/80 via-ink-700 to-electric",
        )}
        style={{ boxShadow: "inset 0 0 8px rgba(255,255,255,0.25)" }}
      />
    </div>
  );
}

function QuestionBody({
  question,
  answer,
  onAnswer,
  onAnswerText,
}: {
  question: Question;
  answer?: Answer;
  onAnswer: (optionIds: string[]) => void;
  onAnswerText: (text: string) => void;
}) {
  if (question.type === "short_text") {
    return <ShortText value={answer?.text ?? ""} onChange={onAnswerText} />;
  }
  if (question.type === "multi_choice") {
    return (
      <ChoiceList
        question={question}
        selected={answer?.optionIds ?? []}
        multi
        onChange={onAnswer}
      />
    );
  }
  return (
    <ChoiceList
      question={question}
      selected={answer?.optionIds ?? []}
      onChange={onAnswer}
    />
  );
}

function ChoiceList({
  question,
  selected,
  multi,
  onChange,
}: {
  question: Question;
  selected: string[];
  multi?: boolean;
  onChange: (ids: string[]) => void;
}) {
  if (!question.options) return null;
  return (
    <div className="grid gap-2 sm:gap-3">
      {question.options.map((o) => {
        const isSelected = selected.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            whileHover={{
              y: -3,
              scale: 1.02,
              transition: {
                type: "tween",
                duration: 0.08,   // nearly instant
                ease: "easeOut",
              }
              }}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
              if (multi) {
                onChange(
                  isSelected ? selected.filter((s) => s !== o.id) : [...selected, o.id],
                );
              } else {
                onChange(isSelected ? [] : [o.id]);
              }
            }}
            className={cn(
              "group w-full text-left rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 border transition-all flex items-center gap-2.5 sm:gap-3.5",
              isSelected
                ? "border-ink bg-ink text-white shadow-sm"
                : "border-line bg-white hover:bg-electric-tint hover:border-[#FAE251] hover:shadow-[0_12px_24px_-8px_rgba(110,110,180,0.25)] text-ink",
            )}
          >
            <span
              className={cn(
                "shrink-0 size-6 sm:size-7 rounded-full border flex items-center justify-center transition-all",
                isSelected
                  ? "bg-electric border-electric"
                  : "border-line group-hover:border-[#FAE251]",
              )}
            >
              {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </span>
            <span className="text-[14px] sm:text-[16px] md:text-[17px] leading-snug flex-1">{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function ShortText({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type freely. No right answer."
      rows={3}
      className={cn(
        "w-full rounded-xl border border-line bg-surface-subtle px-4 py-2.5 sm:px-5 sm:py-4 text-[14px] sm:text-[16px] md:text-[17px] text-ink",
        "placeholder:text-ink-300 focus:outline-none focus:border-electric",
        "focus:bg-white focus:shadow-[0_0_0_3px_rgba(243,166,217,0.25)] transition-all resize-none",
      )}
    />
  );
}
