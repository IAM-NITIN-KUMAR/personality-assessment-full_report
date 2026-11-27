"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAssessment } from "@/lib/store";
import { getScreen } from "@/lib/v2/flow";
import { Q0_KEY_BY_DISCIPLINE } from "@/lib/v2/question-bank";
import { toFpAnswers } from "@/lib/v2/fp/score";
import { pageDone, POST_PAGES, PRE_PAGES } from "@/lib/v2/fp/steps";
import type { FpPage } from "@/lib/v2/fp/steps";
import { minutesLeft, opensWithIntro, paceSeconds, sectionProgress, testSequence } from "@/lib/v2/test-sections";
import { FpPageView } from "@/components/v2/fp-step";
import { SectionIntro, StageHeader, StageNav, StageStats } from "@/components/v2/test-stage";
import { QuestionCard } from "@/components/node-graph/question-card";
import { AssessmentChrome } from "@/components/assessment-chrome";
import { cn } from "@/lib/utils";
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

/** The First Principles questions the test asks: two before the main questions and one after. */
const FP_PAGES = new Map<string, FpPage>([...PRE_PAGES, ...POST_PAGES].map((p) => [p.id, p]));

/** What the card needs to show one question, whichever bank it comes from. */
interface View {
  category: string;
  prompt: string;
  hint?: string;
  multi: boolean;
  /** Most options a multi-select accepts. */
  max?: number;
  options: { id: string; label: string }[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Runs `check` as soon as the question it sits beside is laid out, and again when the window changes size. */
function FitProbe({ check }: { check: () => void }) {
  const latest = useRef(check);
  latest.current = check;
  useLayoutEffect(() => {
    const run = () => latest.current();
    run();
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, []);
  return null;
}

export default function V2AssessmentFlow() {
  const router = useRouter();
  const answers = useAssessment((s) => s.answers);
  const saveAnswer = useAssessment((s) => s.answer);
  const unanswer = useAssessment((s) => s.unanswer);
  const profile = useAssessment((s) => s.profile);
  const reset = useAssessment((s) => s.reset);
  const still = useReducedMotion();

  // A pick lives here until it is saved: single-choice saves itself a moment after the tap,
  // multi-select on Next. The ref carries the latest pick into the card's delayed callback.
  const [selected, setSelected] = useState<string[]>([]);
  const selectedRef = useRef<string[]>([]);
  // Which way the student is moving, so a question slides in from the side it came from.
  const [direction, setDirection] = useState<1 | -1>(1);
  // Parts whose opening page has been shown (or that the student stepped back into).
  const [seenIntro, setSeenIntro] = useState<Set<number>>(() => new Set());
  // Answers taken back with Previous, so the earlier pick is still marked when the question returns.
  const takenBack = useRef<Record<string, string[]>>({});
  // The question that does not fit the screen with the three number tiles under it, so the numbers
  // are shown as one line for that question.
  const scroller = useRef<HTMLDivElement>(null);
  const [tightFor, setTightFor] = useState<string | null>(null);

  const v2Answers: V2Answers = useMemo(() => toV2Answers(answers), [answers]);
  const fp = useMemo(() => toFpAnswers(answers), [answers]);

  // The degree question never shows for a registered field of study: it is filled in from
  // the profile. It stays in the test only for a profile with no field of study.
  const askDegree = !profile?.discipline;
  useEffect(() => {
    if (!v2Answers.Q0 && profile?.discipline) {
      const key = Q0_KEY_BY_DISCIPLINE[profile.discipline] ?? "e";
      saveAnswer("Q0", { optionIds: [key] });
    }
  }, [v2Answers.Q0, profile?.discipline, saveAnswer]);

  // One question per page, in one fixed order; the student is always on the first unanswered one.
  const sequence = useMemo(() => testSequence(v2Answers, askDegree), [v2Answers, askDegree]);
  const index = sequence.findIndex(({ id }) => {
    const page = FP_PAGES.get(id);
    return page ? !pageDone(page, fp) : !v2Answers[id as ScreenId]?.length;
  });
  const finished = index === -1;
  const item = finished ? null : sequence[index];
  const currentId = item?.id ?? null;

  const fpPage = item ? FP_PAGES.get(item.id) : undefined;
  const view: View | null = !item
    ? null
    : fpPage
      ? {
          category: fpPage.category,
          prompt: fpPage.prompt,
          hint: fpPage.hint ?? fpPage.lead,
          multi: !!fpPage.multi,
          max: fpPage.max,
          options: fpPage.options.map((o) => ({ id: o.id, label: o.label })),
        }
      : (() => {
          const screen = getScreen(item.id as ScreenId, v2Answers);
          return {
            category: screen.category,
            prompt: screen.prompt,
            hint: screen.hint,
            multi: !!screen.multi,
            options: screen.options.map((o) => ({ id: o.key, label: o.label })),
          };
        })();
  const viewRef = useRef<View | null>(view);
  viewRef.current = view;

  useEffect(() => {
    if (finished) router.push("/report");
  }, [finished, router]);

  // A new question starts with nothing picked, unless the student came back to it.
  useEffect(() => {
    const options = viewRef.current?.options ?? [];
    const earlier = currentId ? takenBack.current[currentId] ?? [] : [];
    const picks = earlier.filter((id) => options.some((o) => o.id === id));
    setSelected(picks);
    selectedRef.current = picks;
  }, [currentId]);

  const onReset = () => {
    if (confirm("Start over from the beginning?")) {
      reset();
      router.push("/");
    }
  };

  if (!item || !view) return null;

  const parts = sectionProgress(sequence, index);
  const pace = paceSeconds(
    sequence.slice(0, index).flatMap(({ id }) => (answers[id]?.answeredAt ? [answers[id].answeredAt] : [])),
  );
  const showIntro = opensWithIntro(sequence, index) && !seenIntro.has(item.section);
  const tight = tightFor === item.id;

  const pick = (ids: string[]) => {
    // At the limit, the newest pick replaces the oldest rather than being ignored.
    const picks = view.max && ids.length > view.max ? ids.slice(-view.max) : ids;
    setSelected(picks);
    selectedRef.current = picks;
  };

  const save = () => {
    const picks = selectedRef.current;
    if (!picks.length) return;
    setDirection(1);
    delete takenBack.current[item.id];
    saveAnswer(item.id, { optionIds: picks });
  };

  // Previous takes back the last answer, so that question is asked again with the earlier pick
  // still marked. Going back one at a time keeps later answers from outliving the one they depend on.
  const goBack =
    index === 0
      ? undefined
      : () => {
          const target = sequence[index - 1];
          takenBack.current[target.id] = answers[target.id]?.optionIds ?? [];
          setDirection(-1);
          setSeenIntro((seen) => new Set(seen).add(target.section));
          unanswer(target.id);
        };

  const question: Question = {
    id: item.id,
    section: "main_character",
    kind: "anchor",
    type: view.multi ? "multi_choice" : "single_choice",
    category: view.category,
    prompt: view.prompt,
    hint: view.hint,
    options: view.options,
  };

  // A First Principles page that is not a plain choice (free text, a 1-to-5 scale) brings its own card.
  const ownCard = fpPage && fpPage.kind !== "choice";

  const slide = {
    enter: (d: number) => ({ opacity: 0, x: still ? 0 : d * 36 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.34, ease: EASE } },
    exit: (d: number) => ({ opacity: 0, x: still ? 0 : d * -36, transition: { duration: 0.16, ease: "easeIn" as const } }),
  };

  return (
    <AssessmentChrome name={profile?.name ?? ""} onReset={onReset}>
      <div ref={scroller} className="flex-1 min-h-0 relative z-10 overflow-y-auto overflow-x-hidden px-4 md:px-8">
        {/* On a phone the page fills the screen: the part strip at the top, the question in the
            middle, the numbers and Previous / Next at the foot. On a wide screen the three sit together. */}
        <div
          className={cn(
            "w-full max-w-3xl mx-auto min-h-full flex flex-col md:justify-center pt-4 sm:pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6",
            tight ? "gap-3" : "gap-4",
          )}
        >
          <AnimatePresence initial={false}>
            {!showIntro && (
              <motion.div
                key="stage"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <StageHeader
                  section={item.section}
                  category={view.category}
                  index={index}
                  total={sequence.length}
                  parts={parts}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 md:flex-none flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={showIntro ? `intro-${item.section}` : item.id}
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {!showIntro && (
                  <FitProbe
                    check={() => {
                      const box = scroller.current;
                      if (box && box.scrollHeight > box.clientHeight + 1) setTightFor(item.id);
                    }}
                  />
                )}
                {showIntro ? (
                  <SectionIntro
                    section={item.section}
                    questions={parts[item.section].total}
                    minutes={minutesLeft(parts[item.section].total, pace)}
                    parts={parts}
                    onPrevious={goBack}
                    onContinue={() => {
                      setDirection(1);
                      setSeenIntro((seen) => new Set(seen).add(item.section));
                    }}
                  />
                ) : ownCard ? (
                  <FpPageView
                    key={item.id}
                    page={fpPage}
                    positionLabel={`${index + 1} of ${sequence.length}`}
                    onSubmit={(entries) => {
                      setDirection(1);
                      entries.forEach((e) => saveAnswer(e.id, { optionIds: e.optionIds, text: e.text }));
                    }}
                  />
                ) : (
                  <QuestionCard
                    bare
                    hideNext
                    question={question}
                    answer={selected.length ? { questionId: item.id, optionIds: selected, answeredAt: 0 } : undefined}
                    onAnswer={(partial) => pick(partial.optionIds ?? [])}
                    onAutoAdvance={save}
                    onNext={save}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {!showIntro && (
              <motion.div
                key="foot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.35, ease: EASE }}
                className={tight ? "space-y-3" : "space-y-4"}
              >
                <StageStats
                  index={index}
                  total={sequence.length}
                  minutes={minutesLeft(sequence.length - index, pace)}
                  compact={tight}
                />
                {/* A page with its own card moves on by itself, so it gets Previous only. */}
                {ownCard ? (
                  goBack && <StageNav onPrevious={goBack} />
                ) : (
                  <StageNav onPrevious={goBack} onNext={save} canNext={selected.length > 0} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AssessmentChrome>
  );
}
