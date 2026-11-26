"use client";

import { useEffect, useRef, useState } from "react";
import { CornerMotif, QuestionCard } from "@/components/node-graph/question-card";
import { cn } from "@/lib/utils";
import type { FpPage } from "@/lib/v2/fp/steps";
import type { Answer, Question } from "@/lib/types";

export interface FpCommit { id: string; optionIds?: string[]; text?: string }

/** Same pause the main question card takes after a tap, so the student sees their pick land. */
const AUTO_ADVANCE_DELAY = 420;

/** Choice and free-text pages reuse the main QuestionCard, so the module feels like the rest of the test. */
function Card({ page, positionLabel, onSubmit }: { page: FpPage; positionLabel: string; onSubmit: (c: FpCommit[]) => void }) {
  const [answer, setAnswer] = useState<Partial<Answer>>({});
  const ref = useRef<Partial<Answer>>({});

  const question: Question = {
    id: page.id,
    section: "main_character",
    kind: "anchor",
    type: page.kind === "text" ? "short_text" : page.multi ? "multi_choice" : "single_choice",
    category: page.category,
    prompt: page.prompt,
    hint: page.hint ?? page.lead,
    options: page.kind === "choice" ? page.options.map((o) => ({ id: o.id, label: o.label })) : undefined,
  };
  const commit = () => {
    const a = ref.current;
    if (page.kind === "text" && a.text?.trim()) onSubmit([{ id: page.id, text: a.text.trim() }]);
    else if (page.kind === "choice" && a.optionIds?.length) onSubmit([{ id: page.id, optionIds: a.optionIds }]);
  };
  return (
    <QuestionCard
      question={question}
      answer={answer.optionIds?.length || answer.text ? { questionId: page.id, answeredAt: 0, ...answer } : undefined}
      onAnswer={(p) => {
        // At the limit, the newest pick replaces the oldest rather than being ignored.
        const optionIds = p.optionIds && page.max && p.optionIds.length > page.max ? p.optionIds.slice(-page.max) : p.optionIds;
        const next = { ...ref.current, ...p, ...(p.optionIds ? { optionIds } : {}) };
        ref.current = next;
        setAnswer(next);
      }}
      onAutoAdvance={commit}
      onNext={commit}
      positionLabel={positionLabel}
    />
  );
}

/** One statement or dial, rated 1 to 5. A tap answers it and moves on. */
function ScaleCard({ page, positionLabel, onSubmit }: { page: FpPage; positionLabel: string; onSubmit: (c: FpCommit[]) => void }) {
  const [value, setValue] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  // The last tap inside the pause wins, so a slip of the thumb can be corrected.
  const pick = (id: string) => {
    setValue(id);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSubmit([{ id: page.id, optionIds: [id] }]), AUTO_ADVANCE_DELAY);
  };

  return (
    <div className="panel relative w-full p-5 sm:p-8 md:p-12">
      <CornerMotif kind="anchor" />

      <div className="mb-4 sm:mb-7 relative">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="active-dot" />
          <span className="mono-eyebrow text-ink-700">{page.category}</span>
        </div>
        <div className="mono-eyebrow text-ink-300">{positionLabel}</div>
      </div>

      {page.lead && <p className="text-[13px] sm:text-[15px] font-semibold text-electric mb-2 pr-10">{page.lead}</p>}
      <h2 className="display-md text-[20px] sm:text-[26px] md:text-[32px] text-ink mb-1.5 sm:mb-2 text-balance leading-tight">
        {page.prompt}
      </h2>
      {page.hint && <p className="text-[14px] sm:text-[16px] text-ink-400">{page.hint}</p>}

      <div className="mt-7 sm:mt-9 max-w-md">
        <div role="radiogroup" aria-label={page.prompt} className="flex justify-between gap-2">
          {page.options.map((o) => {
            const on = value === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(o.id)}
                className={cn(
                  "size-12 sm:size-14 shrink-0 rounded-full border text-[16px] sm:text-[17px] font-bold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2",
                  on ? "bg-electric border-electric text-white" : "bg-white border-line text-ink-600 hover:border-electric-400 hover:bg-electric-tint",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        {page.anchors && (
          <div className="mt-3 flex justify-between gap-6 text-[12px] sm:text-[13px] leading-snug text-ink-400">
            <span>1 · {page.anchors[0]}</span>
            <span className="text-right">5 · {page.anchors[1]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** One page of the First Principles module: a single question. */
export function FpPageView({ page, positionLabel, onSubmit }: {
  page: FpPage; positionLabel: string; onSubmit: (c: FpCommit[]) => void;
}) {
  return page.kind === "scale"
    ? <ScaleCard page={page} positionLabel={positionLabel} onSubmit={onSubmit} />
    : <Card page={page} positionLabel={positionLabel} onSubmit={onSubmit} />;
}
