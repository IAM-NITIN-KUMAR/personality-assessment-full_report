"use client";

import { motion } from "framer-motion";
import { REACTIONS, Reaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  selected?: Reaction;
  onSelect: (r: Reaction) => void;
  /** Disable while a reaction is generating a probe/rephrase. */
  busy?: boolean;
}

/**
 * Compact reactions row. Apple-style emojis served as PNGs from jsdelivr so
 * Windows/Linux users see the same iOS-rendered emoji as Mac users.
 *
 * Reactions DO NOT advance the question. They drive the LLM:
 *   positive (fire, love)  → probe deeper after this card
 *   negative (meh, bored)  → rephrase this card in place
 *   neutral  (think)       → store telemetry only
 */
export function ReactionBar({ selected, onSelect, busy }: Props) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full bg-white border border-line/60 px-1.5 py-1 shadow-[0_2px_8px_-2px_rgba(10,14,26,0.06)]"
      onClick={(e) => e.stopPropagation()}
    >
      {REACTIONS.map((r) => {
        const active = selected === r.id;
        return (
          <motion.button
            key={r.id}
            type="button"
            aria-label={r.label}
            title={r.label}
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect(r.id);
            }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.18, y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={cn(
              "size-8 rounded-full flex items-center justify-center transition-all relative",
              active
                ? "bg-electric/15 ring-2 ring-electric scale-110"
                : "hover:bg-line/40",
              busy && "opacity-50",
            )}
          >
            <img
              src={r.appleSrc}
              alt={r.emoji}
              draggable={false}
              className="size-5 select-none pointer-events-none"
              loading="eager"
            />
          </motion.button>
        );
      })}
    </div>
  );
}
