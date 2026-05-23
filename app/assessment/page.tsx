"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { useAssessment } from "@/lib/store";
import { AssessmentGraph } from "@/components/node-graph/assessment-graph";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

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

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const initialActiveSetRef =
    useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!profile) {
      router.replace("/");
      return;
    }

    if (initialActiveSetRef.current) return;

    if (trunkIds.length === 0) {
      const ctxIds =
        anchorsForSection("context").map(
          (q) => q.id
        );

      setTrunk(ctxIds);
      setActiveId(ctxIds[0]);
    } else {
      const firstUnanswered =
        trunkIds.find((id) => !answers[id]);

      setActiveId(
        firstUnanswered ??
          trunkIds[trunkIds.length - 1]
      );
    }

    initialActiveSetRef.current = true;
  }, [
    hydrated,
    profile,
    trunkIds,
    setTrunk,
    router,
    answers,
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

  const handleAnswer = (
    partial: Parameters<typeof answer>[1]
  ) => {
    answer(activeId, partial);
  };

  const handleNext = async () => {
    const step = planNext({
      current,
      trunk,
      discipline: profile.discipline,
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

    if (
      step.kind === "transition" &&
      step.nextSection
    ) {
      if (step.nextSection === "teaser") {
        computeArchetype();
        setSection("teaser");
        router.push("/teaser");
      }

      if (step.nextSection === "report") {
        setSection("report");
        router.push("/report");
      }
    }
  };

  const handleNextOrAdvance =
    async () => {
      const isAtEnd =
        currentIndex === trunk.length - 1;

      if (isAtEnd) {
        await handleNext();
      } else {
        setActiveId(
          trunk[currentIndex + 1].id
        );
      }
    };

  const totalQs =
    totalQuestionCountFor(
      profile.discipline
    );

  const positionLabel = `${
    currentIndex + 1
  } of ~${totalQs}`;

  return (
    <main
      className="min-h-dvh overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at 10% 30%, rgba(244, 184, 212, 0.22), transparent 28%),
          radial-gradient(circle at 88% 18%, rgba(196, 181, 253, 0.18), transparent 26%),
          radial-gradient(circle at 72% 82%, rgba(186, 230, 253, 0.14), transparent 28%),
          linear-gradient(
            135deg,
            #f8eef2 0%,
            #f1edf6 45%,
            #eef3f9 100%
          )
        `,
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[-4%] h-[420px] w-[420px] rounded-full bg-pink-300/18 blur-[120px]" />

        <div className="absolute top-[12%] right-[-6%] h-[380px] w-[380px] rounded-full bg-violet-300/16 blur-[120px]" />

        <div className="absolute bottom-[-8%] right-[18%] h-[340px] w-[340px] rounded-full bg-blue-200/14 blur-[110px]" />

        <div className="absolute top-[38%] left-[42%] h-[180px] w-[180px] rounded-full bg-fuchsia-200/10 blur-[90px]" />
      </div>

      <Header
        profile={profile}
        sectionLabel={
          SECTION_HEADER[section]
        }
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
      />

  <div className="relative z-10">

  <AssessmentGraph
    trunk={trunk}
    answers={answers}
    activeId={activeId}
    onActivate={setActiveId}
    onAnswer={handleAnswer}
    onNext={handleNextOrAdvance}
    loadingNext={false}
    positionLabel={positionLabel}
  />
</div>
    </main>
  );
}

const SECTION_HEADER: Record<
  Section,
  string
> = {
  context: "Context",
  roots: "Roots",
  teaser: "Archetype",
  routes: "Routes",
  report: "Report",
};

function Header({
  profile,
  sectionLabel,
  onReset,
}: {
  profile: { name: string };
  sectionLabel: string;
  onReset: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />

          <div>
            <div className="font-mono text-[13px] font-semibold tracking-wide leading-none uppercase">
              Roots{" "}
              <span className="text-ink-300">
                /
              </span>{" "}
              Routes
            </div>

            <div className="mono-eyebrow text-ink-300 mt-1.5">
              {sectionLabel} ·{" "}
              {
                profile.name.split(" ")[0]
              }
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onReset}
        >
          <RotateCcw className="h-3 w-3" />
          Start over
        </Button>
      </div>
    </header>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="mono-eyebrow text-ink-300 animate-pulse">
        LOADING ASSESSMENT…
      </div>
    </main>
  );
}