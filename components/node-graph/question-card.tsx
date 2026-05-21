"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Question, Answer, Reaction } from "@/lib/types";
import { ReactionBar } from "./reaction-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  answer?: Answer;
  onAnswer: (partial: Partial<Answer>) => void;
  onReact: (r: Reaction) => void;
  onNext: () => void;
  /** Called after a single_choice option is selected, to auto-advance. */
  onAutoAdvance?: () => void;
  loadingNext?: boolean;
  /** True while a reaction is generating a deeper probe or rephrase. */
  reactionBusy?: boolean;
  positionLabel?: string;
}

const AUTO_ADVANCE_DELAY = 420;        // ms — single_choice, snappy
const MULTI_ADVANCE_DELAY = 2200;      // ms — multi_choice, gives room to pick more

export function QuestionCard({
  question,
  answer,
  onAnswer,
  onReact,
  onNext,
  onAutoAdvance,
  loadingNext,
  reactionBusy,
  positionLabel,
}: Props) {
  const canAdvance = isAnswered(question, answer);
  // Manual Next button shows ONLY on free-text questions. Choice questions
  // (single or multi) auto-advance — single after a snappy beat, multi after
  // a slightly longer beat that resets if the student taps another option.
  const showManualNext = question.type === "short_text";

  const advancedRef = useRef(false);
  const advanceTimeoutRef = useRef<number | null>(null);

  const handleSelect = (optionIds: string[]) => {
    onAnswer({ optionIds });
    if (optionIds.length === 0 || !onAutoAdvance || reactionBusy) return;

    if (question.type === "single_choice") {
      if (advancedRef.current) return;
      advancedRef.current = true;
      advanceTimeoutRef.current = window.setTimeout(() => {
        onAutoAdvance();
        advanceTimeoutRef.current = null;
      }, AUTO_ADVANCE_DELAY);
      return;
    }

    if (question.type === "multi_choice") {
      // Reset the pending timer every tap so the student can keep picking
      // until they stop. Once they pause for MULTI_ADVANCE_DELAY, we advance.
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
      advancedRef.current = false;
      advanceTimeoutRef.current = window.setTimeout(() => {
        onAutoAdvance();
        advanceTimeoutRef.current = null;
      }, MULTI_ADVANCE_DELAY);
    }
  };

  useEffect(() => {
    advancedRef.current = false;
  }, [question.id]);

  // Cancel any pending auto-advance the moment a reaction starts processing.
  // Without this, a user who quickly clicks Option-then-Emoji gets skipped
  // off the card before their rewrite lands.
  useEffect(() => {
    if (reactionBusy && advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
      advancedRef.current = false;
    }
  }, [reactionBusy]);

  const reactionTone = answer?.reaction;
  const wasReworked = !!reactionTone && reactionTone !== "think";

  return (
    <div
      className={cn(
        "panel relative w-full p-8 md:p-10",
        question.kind === "adaptive" && "ring-1 ring-electric/20",
        reactionBusy && "pointer-events-none",
      )}
    >
      <CornerMotif kind={question.kind} />

      <div className="mb-7 relative">
        {/* Eyebrow row — wraps freely, reactions never compete with it. */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="active-dot" />
          <span className="mono-eyebrow text-ink-700">{question.category}</span>
          {question.kind === "adaptive" && (
            <span className="inline-flex items-center gap-1 mono-eyebrow text-electric">
              <Sparkles className="h-3 w-3" />
              ADAPTIVE
            </span>
          )}
          {wasReworked && (
            <span className="mono-eyebrow text-electric">· REWORKED</span>
          )}
        </div>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          {positionLabel && (
            <div className="mono-eyebrow text-ink-300">{positionLabel}</div>
          )}
          {/* Reaction bar — its own line on narrow screens, end-aligned on wide. */}
          <ReactionBar selected={answer?.reaction} onSelect={onReact} busy={reactionBusy} />
        </div>
      </div>

      <motion.h2
        key={question.prompt}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="display-md text-[28px] md:text-[32px] text-ink mb-2 text-balance"
      >
        {question.prompt}
      </motion.h2>
      {question.hint && (
        <p className="text-[14px] text-ink-400 mb-6">{question.hint}</p>
      )}

      <div className="mt-6">
        <QuestionBody
          question={question}
          answer={answer}
          onAnswer={handleSelect}
          onAnswerText={(text) => onAnswer({ text })}
        />
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-line/70">
        <div className="mono-eyebrow text-ink-300">
          {reactionBusy
            ? "REWORKING THIS QUESTION…"
            : answer?.reaction
              ? "QUESTION RATED ✓"
              : "RATE THE QUESTION (NOT YOUR ANSWER) ↗"}
        </div>
        {showManualNext && (
          <Button variant="outline" onClick={onNext} disabled={!canAdvance || loadingNext}>
            {loadingNext ? "…" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        {!showManualNext && question.type === "single_choice" && (
          <div className={cn("mono-eyebrow", canAdvance ? "text-ink-400" : "text-ink-300")}>
            {canAdvance ? "ADVANCING…" : "PICK AN OPTION"}
          </div>
        )}
        {!showManualNext && question.type === "multi_choice" && (
          <div className={cn("mono-eyebrow", canAdvance ? "text-ink-400" : "text-ink-300")}>
            {canAdvance ? "ADVANCING · TAP MORE TO STAY" : "PICK ONE OR MORE"}
          </div>
        )}
      </div>
    </div>
  );
}

function isAnswered(q: Question, a?: Answer): boolean {
  if (!a) return false;
  if (q.type === "short_text") return !!a.text && a.text.trim().length > 0;
  return !!a.optionIds && a.optionIds.length > 0;
}

function CornerMotif({ kind }: { kind: string }) {
  // Subtle geometric corner mark, like the BASIC/PRO/ELITE tiles.
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
    <div className="grid gap-2">
      {question.options.map((o) => {
        const isSelected = selected.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            whileTap={{ scale: 0.995 }}
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
              "group w-full text-left rounded-xl px-4 py-3.5 border transition-all flex items-center gap-3.5",
              isSelected
                ? "border-ink bg-ink text-white shadow-sm"
                : "border-line bg-white hover:border-ink/50 text-ink",
            )}
          >
            <span
              className={cn(
                "shrink-0 size-6 rounded-full border flex items-center justify-center transition-all",
                isSelected
                  ? "bg-electric border-electric"
                  : "border-line group-hover:border-ink/40",
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </span>
            <span className="text-[15px] leading-snug flex-1">{o.label}</span>
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
      rows={4}
      className={cn(
        "w-full rounded-xl border border-line bg-surface-subtle px-4 py-3 text-[15px] text-ink",
        "placeholder:text-ink-300 focus:outline-none focus:border-electric/60",
        "focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,58,255,0.10)] transition-all resize-none",
      )}
    />
  );
}
