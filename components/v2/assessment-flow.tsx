"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/lib/store";
import { getScreen, nextScreenId, screenOrder } from "@/lib/v2/flow";
import { QuestionCard } from "@/components/node-graph/question-card";
import { AssessmentChrome } from "@/components/assessment-chrome";
import type { Answer, Question } from "@/lib/types";
import type { OptionKey, ScreenId, V2Answers } from "@/lib/v2/types";

const ALL_V2_IDS: ScreenId[] = [
  "Q0", "A1", "A2", "A3", "A4", "A5", "A6", "A7",
  "B1", "B2", "B3", "B4", "B5", "B6",
  "C1", "C2", "C3", "C4", "C5", "D1", "D2",
  "E1", "E2", "E3", "F1", "F2", "F3", "F4", "F5a", "F5b", "F5c",
];

export function toV2Answers(answers: Record<string, Answer>): V2Answers {
  const out: V2Answers = {};
  for (const id of ALL_V2_IDS) {
    const a = answers[id];
    if (a?.optionIds?.length) out[id] = a.optionIds as OptionKey[];
  }
  return out;
}

export default function V2AssessmentFlow() {
  const router = useRouter();
  const answers = useAssessment((s) => s.answers);
  const saveAnswer = useAssessment((s) => s.answer);
  const profile = useAssessment((s) => s.profile);
  const reset = useAssessment((s) => s.reset);

  // Selection lives here until it commits: single-choice commits on the card's
  // auto-advance tick, multi-select on Next. A ref carries the latest keys into
  // the card's delayed callback without going stale.
  const [selected, setSelected] = useState<OptionKey[]>([]);
  const selectedRef = useRef<OptionKey[]>([]);

  const v2Answers: V2Answers = useMemo(() => toV2Answers(answers), [answers]);

  const currentId = nextScreenId(v2Answers);

  useEffect(() => {
    if (currentId === null) router.push("/report");
  }, [currentId, router]);
  useEffect(() => {
    setSelected([]);
    selectedRef.current = [];
  }, [currentId]);

  if (currentId === null) return null;
  const screen = getScreen(currentId, v2Answers);
  const order = screenOrder(v2Answers);
  const done = order.indexOf(currentId);

  const question: Question = {
    id: screen.id,
    section: "main_character",
    kind: "anchor",
    type: screen.multi ? "multi_choice" : "single_choice",
    category: screen.category,
    prompt: screen.prompt,
    hint: screen.hint,
    options: screen.options.map((o) => ({ id: o.key, label: o.label })),
  };

  const commit = (keys: OptionKey[]) => {
    if (keys.length) saveAnswer(currentId, { optionIds: keys });
  };

  return (
    <AssessmentChrome
      name={profile?.name ?? ""}
      sectionLabel={screen.category}
      onReset={() => {
        if (confirm("Start over from the beginning?")) {
          reset();
          router.push("/");
        }
      }}
    >
      <div className="flex-1 flex flex-col justify-center relative z-10 overflow-y-auto px-4 md:px-8">
        <motion.div
          key={currentId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl mx-auto py-6"
        >
          <QuestionCard
            question={question}
            answer={
              selected.length
                ? { questionId: currentId, optionIds: selected, answeredAt: 0 }
                : undefined
            }
            onAnswer={(partial) => {
              const keys = (partial.optionIds ?? []) as OptionKey[];
              setSelected(keys);
              selectedRef.current = keys;
            }}
            onAutoAdvance={() => commit(selectedRef.current)}
            onNext={() => commit(selectedRef.current)}
            positionLabel={`${done + 1} of ${order.length}`}
          />
        </motion.div>
      </div>
    </AssessmentChrome>
  );
}
