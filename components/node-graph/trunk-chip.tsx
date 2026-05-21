"use client";

import { motion } from "framer-motion";
import { Question, Answer, REACTIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  answer?: Answer;
  onEdit: () => void;
  active?: boolean;
}

export function TrunkChip({ question, answer, onEdit, active }: Props) {
  const summary = summarize(question, answer);
  const reactionDef = answer?.reaction
    ? REACTIONS.find((r) => r.id === answer.reaction)
    : null;

  return (
    <motion.button
      layout
      type="button"
      onClick={onEdit}
      whileHover={{ x: 2 }}
      className={cn(
        "group max-w-md w-full text-left rounded-lg px-3.5 py-2 transition-all flex items-center gap-3",
        "border border-line bg-white hover:border-ink/40",
        active && "border-electric ring-1 ring-electric/30",
        question.kind === "adaptive" && "border-dashed",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="mono-eyebrow text-ink-300 flex items-center gap-2">
          <span>{question.category}</span>
          {question.kind === "adaptive" && (
            <span className="text-electric normal-case tracking-normal text-[10px]">·&nbsp;follow-up</span>
          )}
        </div>
        <div className="text-[13px] text-ink-700 truncate mt-0.5">{summary}</div>
      </div>
      {reactionDef && (
        <img
          src={reactionDef.appleSrc}
          alt={reactionDef.emoji}
          className="size-4 shrink-0 select-none"
          draggable={false}
        />
      )}
    </motion.button>
  );
}

function summarize(q: Question, a?: Answer): string {
  if (!a) return q.prompt.slice(0, 60) + (q.prompt.length > 60 ? "…" : "");
  if (a.text) return a.text.slice(0, 80) + (a.text.length > 80 ? "…" : "");
  if (a.optionIds?.length && q.options) {
    const labels = q.options
      .filter((o) => a.optionIds!.includes(o.id))
      .map((o) => o.label);
    const joined = labels.join(", ");
    return joined.slice(0, 80) + (joined.length > 80 ? "…" : "");
  }
  return q.prompt.slice(0, 60) + "…";
}
