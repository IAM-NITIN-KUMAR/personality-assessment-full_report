"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Share2, LogOut } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { ReportView } from "@/components/report-view";
import { Button } from "@/components/ui/button";
import { buildReport } from "@/lib/report-data";

export default function ReportPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const profile = useAssessment((s) => s.profile);
  const archetype = useAssessment((s) => s.archetype);
  const answers = useAssessment((s) => s.answers);
  const allQuestions = useAssessment((s) => s.allQuestions);
  const computeArchetype = useAssessment((s) => s.computeArchetype);

  // Lazy-recompute if missing (e.g. user lands here directly via persisted state).
  useEffect(() => {
    if (hydrated && profile && !archetype) computeArchetype();
  }, [hydrated, profile, archetype, computeArchetype]);

  // Redirect from effect, never during render.
  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  const data = useMemo(() => {
    if (!profile || !archetype) return null;
    return buildReport({
      profile,
      archetype,
      questions: allQuestions(),
      answers,
    });
  }, [profile, archetype, answers, allQuestions]);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/report-pdf"),
      ]);
      const blob = await pdf(<ReportDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roots-and-routes-${data.profile.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleEndSession = () => {
    const ok = confirm(
      "End this session?\n\nMake sure you've downloaded your PDF — your answers will be cleared from this device.",
    );
    if (!ok) return;
    router.push("/thank-you");
  };

  if (!hydrated || !profile) return null;
  if (!data) {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center">
        <div className="mono-eyebrow text-ink-300 animate-pulse">COMPOSING REPORT…</div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => router.push("/assessment")}>
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
          <div className="mono-eyebrow text-ink-700 flex items-center gap-2">
            <span className="active-dot" />
            REPORT · {data.profile.name.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled title="Sharing coming soon">
              <Share2 className="h-3 w-3" />
              Share
            </Button>
            <Button variant="solid" onClick={handleDownload} disabled={downloading}>
              <Download className="h-3 w-3" />
              {downloading ? "Generating…" : "Download PDF"}
            </Button>
            <Button variant="ghost" onClick={handleEndSession} title="End session and return home">
              <LogOut className="h-3 w-3" />
              End session
            </Button>
          </div>
        </div>
      </header>

      <ReportView data={data} />
    </main>
  );
}
