"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DIMENSION_LABELS, Dimension } from "@/lib/types";
import { ROUTES_BCA, ROUTES_BCA_ENGAGEMENT } from "@/lib/question-bank/routes-bca";

export default function TeaserPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const archetype = useAssessment((s) => s.archetype);
  const profile = useAssessment((s) => s.profile);
  const setTrunk = useAssessment((s) => s.setTrunk);
  const trunkIds = useAssessment((s) => s.trunk);
  const setSection = useAssessment((s) => s.setSection);
  const computeArchetype = useAssessment((s) => s.computeArchetype);

  useEffect(() => {
    if (hydrated && profile && !archetype) computeArchetype();
  }, [hydrated, profile, archetype, computeArchetype]);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile || !archetype) return null;

  const top3 = [...archetype.scores]
    .sort((a, b) => Math.abs(b.normalized) - Math.abs(a.normalized))
    .slice(0, 3);

  const handleContinue = () => {
    const routesIds = [...ROUTES_BCA, ROUTES_BCA_ENGAGEMENT].map((q) => q.id);
    const merged = [...trunkIds];
    for (const id of routesIds) if (!merged.includes(id)) merged.push(id);
    setTrunk(merged);
    setSection("routes");
    router.push("/assessment");
  };

  return (
    <main className="min-h-dvh">
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8"
        >
          <span className="active-dot" />
          <span className="mono-eyebrow text-electric">HALFWAY · ARCHETYPE REVEAL</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="display-xl text-[64px] md:text-[88px] text-ink"
        >
          {archetype.name.replace(/^The\s/, "").toUpperCase()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="display-md text-[20px] md:text-[22px] text-ink-500 mt-3"
        >
          {archetype.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="panel mt-12 p-7 md:p-9"
        >
          <div className="mono-eyebrow text-ink-300 mb-3">CORE READING</div>
          <p className="text-[16px] leading-relaxed text-ink-500 text-balance">
            {archetype.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10"
        >
          <div className="mono-eyebrow text-ink-300 mb-4">TOP DIMENSIONS</div>
          <div className="grid gap-2">
            {top3.map((s) => (
              <DimensionRow key={s.dimension} dimension={s.dimension} value={s.normalized} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-14 flex flex-col items-start gap-3"
        >
          <Button variant="solid" onClick={handleContinue} className="px-8 py-4">
            Continue to Routes
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <p className="mono-eyebrow text-ink-300 max-w-md">
            ROUTES SHOWS HOW THIS LANDS IN YOUR FIELD · ~9 MIN
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function DimensionRow({ dimension, value }: { dimension: Dimension; value: number }) {
  const meta = DIMENSION_LABELS[dimension];
  const polarLabel = value >= 0 ? meta.high : meta.low;
  const intensity = Math.abs(value);
  return (
    <div className="panel-subtle px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="mono-eyebrow text-ink-300">{meta.label.toUpperCase()}</div>
        <div className="display-md text-[18px] text-ink mt-1">{polarLabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1 w-32 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-electric" style={{ width: `${Math.min(100, intensity)}%` }} />
        </div>
        <span className="font-mono text-[12px] text-ink-400 w-10 text-right">
          {value > 0 ? "+" : ""}{value}
        </span>
      </div>
    </div>
  );
}
