"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { QuestionCard } from "@/components/node-graph/question-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONCLUSION_IDS } from "@/lib/v2/fp/bank";
import type { FpStep } from "@/lib/v2/fp/bank";
import type { Answer, Question } from "@/lib/types";

export interface FpCommit { id: string; optionIds?: string[]; text?: string }

const PART_TAG: Record<string, string> = { A: "Part A · Starting point", B: "Part B · Assumptions", C: "Part C · Break it down", D: "Part D · Your thinking page" };

function Header({ step, positionLabel }: { step: FpStep; positionLabel: string }) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between gap-3">
        <span className="mono-eyebrow text-[#6e6ef0]">{PART_TAG[step.part]}</span>
        <span className="mono-eyebrow text-ink-300">{positionLabel}</span>
      </div>
      <h2 className="text-[22px] sm:text-[28px] font-extrabold leading-tight text-ink">{step.prompt}</h2>
      {step.hint && <p className="text-[14px] text-ink-400 leading-relaxed">{step.hint}</p>}
    </div>
  );
}

/** Rows of pills: 1-5 scales (assumptions, dials, confidence) or per-row choices (the five work parts). */
function Grid({ step, positionLabel, onSubmit }: { step: Extract<FpStep, { kind: "grid" }>; positionLabel: string; onSubmit: (c: FpCommit[]) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const complete = step.rows.every((r) => vals[r.id]);
  const isScale = step.options.length > 0;
  return (
    <div className="w-full">
      <Header step={step} positionLabel={positionLabel} />
      {isScale && step.anchors && (
        <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider text-ink-300 mb-3 px-1">
          <span>1 · {step.anchors[0]}</span>
          <span>5 · {step.anchors[1]}</span>
        </div>
      )}
      <div className="space-y-3">
        {step.rows.map((row) => {
          const opts = row.options ?? step.options;
          return (
            <div key={row.id} className="rounded-2xl border border-line bg-white/70 p-4 space-y-3">
              <div className="text-[15px] font-semibold text-ink leading-snug">{row.label}</div>
              {isScale && row.left && (
                <div className="flex justify-between text-[11px] text-ink-300">
                  <span>1 · {row.left}</span>
                  <span className="text-right">5 · {row.right}</span>
                </div>
              )}
              <div className={cn("flex gap-2", isScale ? "justify-between sm:justify-start" : "flex-col sm:flex-row sm:flex-wrap")}>
                {opts.map((o) => {
                  const on = vals[row.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setVals((v) => ({ ...v, [row.id]: o.id }))}
                      aria-pressed={on}
                      className={cn(
                        "transition-colors border text-[14px] font-semibold",
                        isScale ? "size-11 rounded-full" : "rounded-xl px-3.5 py-2 text-left",
                        on ? "bg-[#6e6ef0] border-[#6e6ef0] text-white" : "bg-white border-line text-ink-600 hover:border-[#6e6ef0]/60",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          variant="solid"
          disabled={!complete}
          onClick={() => onSubmit(step.rows.map((r) => ({ id: r.id, optionIds: [vals[r.id]] })))}
        >
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function Conclusions({ step, positionLabel, suggested, onSubmit }: { step: FpStep; positionLabel: string; suggested: string[]; onSubmit: (c: FpCommit[]) => void }) {
  const [texts, setTexts] = useState<string[]>(suggested);
  const ready = texts.every((t) => t.trim().length > 10);
  const titles = ["Your career route", "Your work environment", "Your next step"];
  return (
    <div className="w-full">
      <Header step={step} positionLabel={positionLabel} />
      <div className="space-y-4">
        {texts.map((t, i) => (
          <label key={i} className="block rounded-2xl border border-line bg-white/70 p-4 space-y-2">
            <span className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6e6ef0]">
              <Sparkles className="size-3.5" /> {i + 1}. {titles[i]}
            </span>
            <textarea
              value={t}
              onChange={(e) => setTexts((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
              rows={3}
              className="w-full resize-y bg-transparent text-[15px] leading-relaxed text-ink outline-none"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-ink-300">Your coach will ask &ldquo;why&rdquo; up to five times on each one, so write what you really think.</p>
      <div className="mt-5 flex justify-end">
        <Button variant="solid" disabled={!ready} onClick={() => onSubmit(CONCLUSION_IDS.map((id, i) => ({ id, text: texts[i].trim() })))}>
          Save and see my report <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** Choice and free-text steps reuse the main QuestionCard so the module feels like the rest of the test. */
function Card({ step, positionLabel, onSubmit }: { step: Extract<FpStep, { kind: "choice" | "text" }>; positionLabel: string; onSubmit: (c: FpCommit[]) => void }) {
  const [answer, setAnswer] = useState<Partial<Answer>>({});
  const ref = useRef<Partial<Answer>>({});
  useEffect(() => { setAnswer({}); ref.current = {}; }, [step.id]);

  const question: Question = {
    id: step.id,
    section: "main_character",
    kind: "anchor",
    type: step.kind === "text" ? "short_text" : step.multi ? "multi_choice" : "single_choice",
    category: step.category,
    prompt: step.prompt,
    hint: step.hint,
    options: step.kind === "choice" ? step.options.map((o) => ({ id: o.id, label: o.label })) : undefined,
  };
  const commit = () => {
    const a = ref.current;
    if (step.kind === "text" && a.text?.trim()) onSubmit([{ id: step.id, text: a.text.trim() }]);
    else if (step.kind === "choice" && a.optionIds?.length) onSubmit([{ id: step.id, optionIds: a.optionIds }]);
  };
  return (
    <QuestionCard
      question={question}
      answer={answer.optionIds || answer.text ? { questionId: step.id, answeredAt: 0, ...answer } : undefined}
      onAnswer={(p) => { const next = { ...ref.current, ...p }; ref.current = next; setAnswer(next); }}
      onAutoAdvance={commit}
      onNext={commit}
      positionLabel={`${PART_TAG[step.part]} · ${positionLabel}`}
    />
  );
}

export function FpStepView({ step, positionLabel, suggested, onSubmit }: {
  step: FpStep; positionLabel: string; suggested: string[]; onSubmit: (c: FpCommit[]) => void;
}) {
  if (step.kind === "grid") return <Grid key={step.id} step={step} positionLabel={positionLabel} onSubmit={onSubmit} />;
  if (step.kind === "conclusions") return <Conclusions key={step.id} step={step} positionLabel={positionLabel} suggested={suggested} onSubmit={onSubmit} />;
  return <Card key={step.id} step={step} positionLabel={positionLabel} onSubmit={onSubmit} />;
}
