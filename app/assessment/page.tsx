"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAssessment } from "@/lib/store";
import { AssessmentGraph, HistoryRail } from "@/components/node-graph/assessment-graph";
import { AssessmentChrome } from "@/components/assessment-chrome";
import V2AssessmentFlow from "@/components/v2/assessment-flow";

import {
  planNext,
  anchorsForSection,
  totalQuestionCountFor,
} from "@/lib/flow";

import {
  Question,
  Section,
} from "@/lib/types";


export default function AssessmentPage() {
  const router = useRouter();

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const profile = useAssessment((s) => s.profile);
  const trunkIds = useAssessment((s) => s.trunk);
  const answers = useAssessment((s) => s.answers);
  const section = useAssessment((s) => s.section);
  const adaptiveQuestions =
    useAssessment((s) => s.adaptiveQuestions);

  const setTrunk = useAssessment((s) => s.setTrunk);
  const setSection =
    useAssessment((s) => s.setSection);

  const answer = useAssessment((s) => s.answer);

  const computeArchetype =
    useAssessment((s) => s.computeArchetype);

  const getQuestion =
    useAssessment((s) => s.getQuestion);

  const reset = useAssessment((s) => s.reset);
  const pushAdaptive = useAssessment((s) => s.pushAdaptive);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [loadingNext, setLoadingNext] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Synchronously initialize activeId on the first render pass after hydration
  if (hydrated && !activeId && trunkIds.length > 0) {
    const firstUnanswered = trunkIds.find((id) => !answers[id]);
    const initialId = firstUnanswered ?? trunkIds[trunkIds.length - 1];
    if (initialId) {
      setActiveId(initialId);
    }
  }

  useEffect(() => {
    if (!hydrated) return;

    if (!profile) {
      router.replace("/");
      return;
    }

    if (trunkIds.length === 0) {
      const ctxIds =
        anchorsForSection("main_character", profile.educationLevel, profile.discipline).map(
          (q) => q.id
        );

      setTrunk(ctxIds);
      setActiveId(ctxIds[0]);
    }
  }, [
    hydrated,
    profile,
    trunkIds,
    setTrunk,
    router,
  ]);

  const trunk: Question[] = useMemo(
    () =>
      trunkIds
        .map((id) => getQuestion(id))
        .filter(Boolean) as Question[],
    [
      trunkIds,
      getQuestion,
      adaptiveQuestions,
    ]
  );

  const currentIndex = activeId
    ? trunk.findIndex((q) => q.id === activeId)
    : -1;

  const current =
    currentIndex >= 0
      ? trunk[currentIndex]
      : undefined;

  if (
    !hydrated ||
    !profile ||
    !activeId ||
    !current ||
    trunk.length === 0
  ) {
    return <LoadingShell />;
  }

  // College (and any profile missing an education level, which defaults to college
  // throughout the app) gets the v2 29-screen flow. School (10th_12th) keeps the
  // legacy JSX below, untouched.
  if (profile.educationLevel !== "10th_12th") {
    return <V2AssessmentFlow />;
  }

  const handleAnswer = (
    partial: Parameters<typeof answer>[1]
  ) => {
    answer(activeId, partial);
  };

  const advanceToNextAnchor = (parent: Question) => {
    const anchors = anchorsForSection(parent.section, profile.educationLevel, profile.discipline);
    const idx = anchors.findIndex((a) => a.id === parent.id);
    const nextAnchor = anchors[idx + 1];

    if (nextAnchor) {
      if (!trunkIds.includes(nextAnchor.id)) {
        setTrunk([...trunkIds, nextAnchor.id]);
      }
      setActiveId(nextAnchor.id);
      if (parent.section !== nextAnchor.section) {
        setSection(nextAnchor.section);
      }
    } else {
      const SECTIONS: Section[] = [
        "main_character",
        "cognitive",
        "skill_check",
        "dream_big",
        "passport_era",
      ];
      const secIdx = SECTIONS.indexOf(parent.section);
      if (secIdx !== -1 && secIdx < SECTIONS.length - 1) {
        const nextSec = SECTIONS[secIdx + 1];
        const nextAnchors = anchorsForSection(nextSec, profile.educationLevel, profile.discipline);
        if (nextAnchors[0]) {
          if (!trunkIds.includes(nextAnchors[0].id)) {
            setTrunk([...trunkIds, nextAnchors[0].id]);
          }
          setActiveId(nextAnchors[0].id);
          setSection(nextSec);
        }
      } else {
        computeArchetype();
        setSection("report");
        router.push("/report");
      }
    }
  };

  const handleNext = async () => {
    const latestAnswers = useAssessment.getState().answers;
    const step = planNext({
      current,
      trunk,
      discipline: profile.discipline,
      educationLevel: profile.educationLevel,
      answers: latestAnswers,
    });

    if (step.kind === "anchor" && step.anchor) {
      if (!trunkIds.includes(step.anchor.id)) {
        setTrunk([
          ...trunkIds,
          step.anchor.id,
        ]);
      }

      setActiveId(step.anchor.id);

      if (
        (
          step as {
            nextSection?: Section;
          }
        ).nextSection
      ) {
        setSection(
          (
            step as {
              nextSection?: Section;
            }
          ).nextSection!
        );
      } else if (
        current.section !==
        step.anchor.section
      ) {
        setSection(step.anchor.section);
      }

      return;
    }

    if (step.kind === "probe" && step.probeParent) {
      setLoadingNext(true);
      try {
        const parentId = step.probeParent.id;
        const ans = answers[parentId];
        const selectedOpt = step.probeParent.options?.find(o => ans?.optionIds?.includes(o.id));
        const parentAnswer = {
          label: selectedOpt?.label || "",
          reaction: ans?.reaction,
        };

        const recentTrail = trunk
          .filter(q => q.id !== parentId && answers[q.id])
          .map(q => {
            const qAns = answers[q.id];
            const opt = q.options?.find(o => qAns.optionIds?.includes(o.id));
            return {
              prompt: q.prompt,
              answer: opt?.label || qAns.text || "",
            };
          })
          .slice(-3);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch("/api/probe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent: step.probeParent,
            parentAnswer,
            recentTrail,
            discipline: profile.discipline,
            section: step.probeParent.section,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error("Failed to fetch adaptive question");
        }

        const data = await res.json();
        if (data.skip || !data.id) {
          console.warn("LLM probe skipped, falling back to next anchor");
          advanceToNextAnchor(step.probeParent);
        } else {
          const adaptiveQuestion = data as Question;
          pushAdaptive(adaptiveQuestion);
          setTrunk([...trunkIds, adaptiveQuestion.id]);
          setActiveId(adaptiveQuestion.id);
        }
      } catch (err) {
        console.error("Error generating probe:", err);
        advanceToNextAnchor(step.probeParent);
      } finally {
        setLoadingNext(false);
      }
      return;
    }

    if (
      step.kind === "transition" &&
      step.nextSection
    ) {
      if (step.nextSection === "report") {
        computeArchetype();
        setSection("report");
        router.push("/report");
      }
    }
  };

  const handleNextOrAdvance =
    async () => {
      const latestAnswers = useAssessment.getState().answers;
      const step = planNext({
        current,
        trunk,
        discipline: profile.discipline,
        educationLevel: profile.educationLevel,
        answers: latestAnswers,
      });



      if (step.kind === "transition" && step.nextSection === "report") {
        computeArchetype();
        setSection("report");
        router.push("/report");
        return;
      }

      const isAtEnd =
        currentIndex === trunk.length - 1;

      if (isAtEnd) {
        await handleNext();
      } else {
        if (step.kind === "anchor" && step.anchor && step.anchor.id !== trunk[currentIndex + 1]?.id) {
          const newTrunkIds = trunkIds.slice(0, currentIndex + 1);
          newTrunkIds.push(step.anchor.id);
          setTrunk(newTrunkIds);
          setActiveId(step.anchor.id);
          if (current.section !== step.anchor.section) {
            setSection(step.anchor.section);
          }
        } else {
          setActiveId(
            trunk[currentIndex + 1].id
          );
        }
      }
    };

  const totalQs =
    totalQuestionCountFor(
      profile.discipline,
      profile.educationLevel,
      answers
    );

  const positionLabel = `${currentIndex + 1} of ${totalQs}`;

  const before = trunk.slice(0, currentIndex);

  return (
    <AssessmentChrome
      name={profile.name}
      sectionLabel={SECTION_HEADER[section]}
      onReset={() => {
        if (
          confirm(
            "Start over from the beginning?"
          )
        ) {
          reset();
          router.push("/");
        }
      }}
    >
      {before.length > 0 && (
        <HistoryRail
          open={historyOpen}
          onToggle={() => setHistoryOpen((s) => !s)}
          items={before}
          answers={answers}
          onActivate={(id) => {
            setHistoryOpen(false);
            setActiveId(id);
          }}
        />
      )}

      <div className="flex-1 flex flex-col justify-center relative z-10 overflow-hidden">

        <AssessmentGraph
          trunk={trunk}
          answers={answers}
          activeId={activeId}
          onActivate={setActiveId}
          onAnswer={handleAnswer}
          onNext={handleNextOrAdvance}
          loadingNext={loadingNext}
          positionLabel={positionLabel}
        />
      </div>
    </AssessmentChrome>
  );
}

const SECTION_HEADER: Record<
  Section,
  string
> = {
  main_character: "Personality",
  cognitive: "Cognitive",
  dream_big: "Career",
  passport_era: "Career",
  skill_check: "Work Environment",
  reality_check: "Reality Check",
  report: "Report",
};

function LoadingShell() {
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="mono-eyebrow text-ink-300 animate-pulse">
        LOADING ASSESSMENT…
      </div>
    </main>
  );
}
