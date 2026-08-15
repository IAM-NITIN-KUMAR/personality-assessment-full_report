"use client";

import type { ScreenV2 } from "@/lib/v2/flow";
import type { OptionKey } from "@/lib/v2/types";

interface Props {
  screen: ScreenV2;
  selected: OptionKey[];
  onToggle: (key: OptionKey) => void;
  onContinue: () => void;
}

/** One v2 screen: category chip, prompt, options. Multi-select shows a Continue button. */
export default function V2Card({ screen, selected, onToggle, onContinue }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600">
        {screen.category}
      </p>
      <h2 className="mb-1 text-lg font-bold text-slate-900">{screen.prompt}</h2>
      {screen.hint && <p className="mb-3 text-sm text-slate-500">{screen.hint}</p>}
      <div className="mt-4 flex flex-col gap-2">
        {screen.options.map((o) => {
          const active = selected.includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onToggle(o.key)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                active
                  ? "border-emerald-600 bg-emerald-50 font-semibold text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {screen.multi && (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={onContinue}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Continue
        </button>
      )}
    </div>
  );
}
