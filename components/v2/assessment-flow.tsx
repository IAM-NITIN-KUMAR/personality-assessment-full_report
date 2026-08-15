"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/lib/store";
import { getScreen, nextScreenId, screenOrder } from "@/lib/v2/flow";
import type { OptionKey, ScreenId, V2Answers } from "@/lib/v2/types";
import V2Card from "./v2-card";

const ALL_V2_IDS: ScreenId[] = [
  "Q0", "A1", "A2", "A3", "A4", "A5", "A6", "A7",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5", "D1", "D2",
  "E1", "E2", "E3", "F1", "F2", "F3", "F4", "F5a", "F5b", "F5c",
];

export default function V2AssessmentFlow() {
  const router = useRouter();
  const answers = useAssessment((s) => s.answers);
  const saveAnswer = useAssessment((s) => s.answer);
  const [pendingMulti, setPendingMulti] = useState<OptionKey[]>([]);

  const v2Answers: V2Answers = useMemo(() => {
    const out: V2Answers = {};
    for (const id of ALL_V2_IDS) {
      const a = answers[id];
      if (a?.optionIds?.length) out[id] = a.optionIds as OptionKey[];
    }
    return out;
  }, [answers]);

  const currentId = nextScreenId(v2Answers);

  useEffect(() => {
    if (currentId === null) router.push("/report");
  }, [currentId, router]);
  useEffect(() => setPendingMulti([]), [currentId]);

  if (currentId === null) return null;
  const screen = getScreen(currentId, v2Answers);
  const order = screenOrder(v2Answers);
  const done = order.indexOf(currentId);

  const commit = (keys: OptionKey[]) => saveAnswer(currentId, { optionIds: keys });
  const onToggle = (key: OptionKey) => {
    if (!screen.multi) return commit([key]);
    setPendingMulti((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto mb-6 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.round((done / order.length) * 100)}%` }}
        />
      </div>
      <p className="mx-auto mb-4 w-full max-w-xl text-right text-xs text-slate-400">
        {done + 1} / {order.length}
      </p>
      <V2Card
        screen={screen}
        selected={screen.multi ? pendingMulti : (v2Answers[currentId] ?? [])}
        onToggle={onToggle}
        onContinue={() => commit(pendingMulti)}
      />
    </div>
  );
}
