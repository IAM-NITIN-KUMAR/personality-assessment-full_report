"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { AssessmentGraph } from "@/components/node-graph/assessment-graph";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { planNext, anchorsForSection, totalQuestionCountFor } from "@/lib/flow";
import { Question, Reaction, REACTIONS, Section } from "@/lib/types";

export default function AssessmentPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const profile = useAssessment((s) => s.profile);
  const trunkIds = useAssessment((s) => s.trunk);
  const answers = useAssessment((s) => s.answers);
  const section = useAssessment((s) => s.section);
  const adaptiveQuestions = useAssessment((s) => s.adaptiveQuestions);
  const rewrites = useAssessment((s) => s.rewrites);

  const setTrunk = useAssessment((s) => s.setTrunk);
  const setSection = useAssessment((s) => s.setSection);
  const answer = useAssessment((s) => s.answer);
  const pushAdaptive = useAssessment((s) => s.pushAdaptive);
  const computeArchetype = useAssessment((s) => s.computeArchetype);
  const getQuestion = useAssessment((s) => s.getQuestion);
  const reset = useAssessment((s) => s.reset);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingProbe, setLoadingProbe] = useState(false);
  /** Once true, we never auto-pick an activeId again — user navigation owns it.
   *  Without this guard, the initial "find first unanswered" logic re-runs on
   *  every keystroke into a short-text question (answers changes → effect re-fires
   *  → activeId jumps to the next unanswered id). */
  const initialActiveSetRef = useRef(false);

  // Initialize trunk + initial activeId on FIRST hydration only.
  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      router.replace("/");
      return;
    }
    if (initialActiveSetRef.current) return;

    if (trunkIds.length === 0) {
      const ctxIds = anchorsForSection("context").map((q) => q.id);
      setTrunk(ctxIds);
      setActiveId(ctxIds[0]);
    } else {
      // Default to first unanswered, else last in trunk.
      const firstUnanswered = trunkIds.find((id) => !answers[id]);
      setActiveId(firstUnanswered ?? trunkIds[trunkIds.length - 1]);
    }
    initialActiveSetRef.current = true;
    // We intentionally don't subscribe to `answers` here — re-running on every
    // keystroke would make typing in short-text fields skip the question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile, trunkIds, setTrunk, router]);

  const trunk: Question[] = useMemo(
    () => trunkIds.map((id) => getQuestion(id)).filter(Boolean) as Question[],
    [trunkIds, getQuestion, adaptiveQuestions, rewrites],
  );

  const currentIndex = activeId ? trunk.findIndex((q) => q.id === activeId) : -1;
  const current = currentIndex >= 0 ? trunk[currentIndex] : undefined;

  if (!hydrated || !profile || !activeId || !current || trunk.length === 0) {
    return <LoadingShell />;
  }

  const handleAnswer = (partial: Parameters<typeof answer>[1]) => {
    answer(activeId, partial);
  };

  const handleNext = async () => {
    const step = planNext({
      current,
      trunk,
      discipline: profile.discipline,
    });

    if (step.kind === "probe" && step.probeParent) {
      setLoadingProbe(true);
      try {
        const probe = await fetchProbe(
          step.probeParent,
          answers[step.probeParent.id],
          trunk,
          answers,
          profile.discipline,
          step.probeParent.section === "routes" ? "routes" : "roots",
        );
        if (probe) {
          pushAdaptive(probe);
          const newTrunk = [...trunkIds];
          const insertAt = newTrunk.indexOf(step.probeParent.id) + 1;
          newTrunk.splice(insertAt, 0, probe.id);
          setTrunk(newTrunk);
          setActiveId(probe.id);
          return;
        }
        // LLM unavailable — fall through to advance to the next anchor instead
        // of showing a stale deterministic fallback (which felt like a duplicate).
      } finally {
        setLoadingProbe(false);
      }
      // Fall through to the next-anchor branch by recomputing planNext as if
      // there were no probe slot here. We simulate by jumping to the same
      // logic: find next anchor, etc.
      const anchorsList = anchorsForSection(current.section, profile.discipline);
      const idx = anchorsList.findIndex((a) => a.id === current.id);
      const nextAnchor = idx >= 0 ? anchorsList[idx + 1] : undefined;
      if (nextAnchor) {
        if (!trunkIds.includes(nextAnchor.id)) {
          setTrunk([...trunkIds, nextAnchor.id]);
        }
        setActiveId(nextAnchor.id);
      } else {
        // End of this section — let the standard transition path run.
        const fallback = planNext({ current, trunk, discipline: profile.discipline });
        if (fallback.kind === "transition" && fallback.nextSection) {
          if (fallback.nextSection === "teaser") {
            computeArchetype();
            setSection("teaser");
            router.push("/teaser");
          } else if (fallback.nextSection === "report") {
            setSection("report");
            router.push("/report");
          }
        }
      }
      return;
    }

    if (step.kind === "anchor" && step.anchor) {
      // Idempotent: only append if this id isn't already in the trunk
      // (e.g. when routes ids were pre-populated by the teaser transition).
      if (!trunkIds.includes(step.anchor.id)) {
        setTrunk([...trunkIds, step.anchor.id]);
      }
      setActiveId(step.anchor.id);
      // If this anchor lives in a new section, switch the global section state.
      if ((step as { nextSection?: Section }).nextSection) {
        setSection((step as { nextSection?: Section }).nextSection!);
      } else if (current.section !== step.anchor.section) {
        setSection(step.anchor.section);
      }
      return;
    }

    if (step.kind === "transition" && step.nextSection) {
      if (step.nextSection === "teaser") {
        computeArchetype();
        setSection("teaser");
        router.push("/teaser");
      } else if (step.nextSection === "report") {
        setSection("report");
        router.push("/report");
      }
      return;
    }
  };

  // If user is editing an earlier card and clicks Next without changes
  // pending, jump them forward to the next-after-current in the trunk.
  const handleNextOrAdvance = async () => {
    const isAtEnd = currentIndex === trunk.length - 1;
    if (isAtEnd) {
      await handleNext();
    } else {
      setActiveId(trunk[currentIndex + 1].id);
    }
  };

  // React → store reaction, then optionally rewrite the SAME card in place:
  //   positive (fire/love) → rewrite sharper, in same vein
  //   negative (meh/bored) → rewrite with a fresh different scenario
  //   neutral  (think)     → no LLM call, just save the reaction
  const handleReact = async (r: Reaction) => {
    if (!current) return;
    react(activeId, r);
    const tone = REACTIONS.find((x) => x.id === r)?.tone;
    if (tone === "neutral" || reactionBusy) return;
    if (tone !== "positive" && tone !== "negative") return;

    setReactionBusy(true);
    try {
      const rewritten = await fetchProbe(
        current,
        { ...answers[current.id], reaction: r },
        trunk,
        answers,
        profile.discipline,
        current.section === "routes" ? "routes" : "roots",
        "rephrase",
        tone,
      );
      if (rewritten) {
        // Clear the option pick only if we actually got a rewrite — otherwise
        // there's no reason to lose the student's existing selection.
        if (answers[current.id]?.optionIds?.length) {
          answer(activeId, { optionIds: [] });
        }
        // Stamp same id so getQuestion swaps the rewrite into the current card.
        setRewrite(current.id, { ...rewritten, id: current.id });
      }
      // If null: LLM unavailable — reaction is still saved as telemetry, but
      // we don't visibly change the card (no fake "rewrite" that's just the
      // same prompt with a suffix).
    } catch (err) {
      console.error("[reaction] rewrite failed:", err);
    } finally {
      setReactionBusy(false);
    }
  };

  const totalQs = totalQuestionCountFor(profile.discipline);
  const positionLabel = `${currentIndex + 1} of ~${totalQs}`;

  return (
    <main className="min-h-dvh relative">
      <Header
        profile={profile}
        sectionLabel={SECTION_HEADER[section]}
        onReset={() => {
          if (confirm("Start over from the beginning? Your answers will be lost.")) {
            reset();
            router.push("/");
          }
        }}
      />

      <AssessmentGraph
        trunk={trunk}
        answers={answers}
        activeId={activeId}
        onActivate={setActiveId}
        onAnswer={handleAnswer}
        onNext={handleNextOrAdvance}
        loadingNext={loadingProbe}
        positionLabel={positionLabel}
      />
    </main>
  );
}

const SECTION_HEADER: Record<Section, string> = {
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
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-line">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />
          <div>
            <div className="font-mono text-[13px] font-semibold tracking-wide leading-none uppercase">
              Roots <span className="text-ink-300">/</span> Routes
            </div>
            <div className="mono-eyebrow text-ink-300 mt-1.5">
              {sectionLabel} · {profile.name.split(" ")[0]}
            </div>
          </div>
        </div>
        <Button variant="ghost" onClick={onReset}>
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
      <div className="mono-eyebrow text-ink-300 animate-pulse">LOADING ASSESSMENT…</div>
    </main>
  );
}

async function fetchProbe(
  parent: Question,
  parentAnswer: { optionIds?: string[]; text?: string; reaction?: string } | undefined,
  trunk: Question[],
  answers: Record<string, { optionIds?: string[]; text?: string }>,
  discipline: string,
  section: "roots" | "routes",
  mode: "deeper" | "rephrase" = "deeper",
  tone?: "positive" | "negative",
): Promise<Question | null> {
  const pickedOption = parent.options?.find((o) =>
    parentAnswer?.optionIds?.includes(o.id),
  );
  const label = pickedOption?.label ?? parentAnswer?.text ?? "";

  const recentTrail = trunk
    .slice(-6, -1)
    .map((q) => {
      const a = answers[q.id];
      const opt = q.options?.find((o) => a?.optionIds?.includes(o.id));
      return { prompt: q.prompt, answer: opt?.label ?? a?.text ?? "(skipped)" };
    });

  const res = await fetch("/api/probe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parent,
      parentAnswer: { label, reaction: parentAnswer?.reaction },
      recentTrail,
      discipline,
      section,
      mode,
      tone,
    }),
  });
  if (!res.ok) throw new Error("probe failed");
  const data = (await res.json()) as Question | { skip: true; reason?: string };
  if ("skip" in data && data.skip) return null;
  return data as Question;
}
