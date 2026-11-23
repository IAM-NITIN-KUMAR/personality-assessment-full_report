"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/lib/store";
import { getScreen, nextScreenId, screenOrder } from "@/lib/v2/flow";
import { Q0_KEY_BY_DISCIPLINE } from "@/lib/v2/question-bank";
import { POST_STEPS, PRE_STEPS } from "@/lib/v2/fp/bank";
import { toFpAnswers } from "@/lib/v2/fp/score";
import { nextPostStep, nextPreStep } from "@/lib/v2/fp/steps";
import { buildThinking } from "@/lib/v2/fp/thinking";
import { computeRadar } from "@/lib/v2/scoring/radar";
import { FpStepView } from "@/components/v2/fp-step";
import type { FpCommit } from "@/components/v2/fp-step";
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

  // Q0 never renders: registration already asked the field of study, so seed
  // the degree answer from the profile's discipline. The Q0 screen stays in
  // the engine as a fallback for profiles with no discipline.
  useEffect(() => {
    if (!v2Answers.Q0 && profile?.discipline) {
      const key = Q0_KEY_BY_DISCIPLINE[profile.discipline] ?? "e";
      saveAnswer("Q0", { optionIds: [key] });
    }
  }, [v2Answers.Q0, profile?.discipline, saveAnswer]);

  // First Principles module: Part A runs before the main test, Parts B-D after it.
  const fp = useMemo(() => toFpAnswers(answers), [answers]);
  const preStep = nextPreStep(fp);
  const coreId = preStep ? null : nextScreenId(v2Answers);
  const postStep = !preStep && coreId === null ? nextPostStep(fp) : null;
  const currentId = coreId;
  const finished = !preStep && !coreId && !postStep;

  useEffect(() => {
    if (finished) router.push("/report");
  }, [finished, router]);
  useEffect(() => {
    setSelected([]);
    selectedRef.current = [];
  }, [currentId]);

  const commitFp = (entries: FpCommit[]) => {
    entries.forEach((e) => saveAnswer(e.id, { optionIds: e.optionIds, text: e.text }));
  };

  const coreCount = screenOrder(v2Answers).filter((id) => id !== "Q0").length;
  const totalCount = PRE_STEPS.length + coreCount + POST_STEPS.length;

  const fpStep = preStep ?? postStep;
  if (fpStep) {
    const index = preStep
      ? PRE_STEPS.findIndex((x) => x.id === fpStep.id)
      : PRE_STEPS.length + coreCount + POST_STEPS.findIndex((x) => x.id === fpStep.id);
    const suggested = fpStep.kind === "conclusions"
      ? [...(buildThinking({ fp, radar: computeRadar(v2Answers) })?.suggested ?? ["", "", ""])]
      : [];
    return (
      <AssessmentChrome
        name={profile?.name ?? ""}
        sectionLabel={fpStep.category}
        onReset={() => {
          if (confirm("Start over from the beginning?")) {
            reset();
            router.push("/");
          }
        }}
      >
        <div className="flex-1 flex flex-col justify-center relative z-10 overflow-y-auto px-4 md:px-8">
          <div className="w-full max-w-3xl mx-auto py-6">
            <FpStepView
              step={fpStep}
              positionLabel={`${index + 1} of ${totalCount}`}
              suggested={suggested}
              onSubmit={commitFp}
            />
          </div>
        </div>
      </AssessmentChrome>
    );
  }

  if (currentId === null) return null;
  const screen = getScreen(currentId, v2Answers);
  // Q0 is seeded from the profile and hidden from the count — unless the
  // fallback actually has to render it (profile without a discipline).
  const order = screenOrder(v2Answers).filter((id) => id !== "Q0" || currentId === "Q0");
  const done = PRE_STEPS.length + order.indexOf(currentId);

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
            positionLabel={`${done + 1} of ${totalCount}`}
          />
        </motion.div>
      </div>
    </AssessmentChrome>
  );
}
