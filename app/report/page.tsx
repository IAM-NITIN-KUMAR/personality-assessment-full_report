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
      <main className="min-h-dvh flex items-center justify-center">
        <div className="mono-eyebrow text-ink-300 animate-pulse">COMPOSING REPORT…</div>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh relative overflow-x-hidden"
      style={{
        background: `
          radial-gradient(circle at 15% 15%, rgba(244, 184, 212, 0.22), transparent 32%),
          radial-gradient(circle at 85% 30%, rgba(196, 181, 253, 0.2), transparent 30%),
          radial-gradient(circle at 30% 75%, rgba(186, 230, 253, 0.16), transparent 35%),
          radial-gradient(circle at 75% 85%, rgba(254, 243, 199, 0.18), transparent 32%),
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
        <div className="absolute top-[5%] left-[-6%] h-[500px] w-[500px] rounded-full bg-pink-300/18 blur-[130px]" />
        <div className="absolute top-[25%] right-[-8%] h-[480px] w-[480px] rounded-full bg-violet-300/16 blur-[130px]" />
        <div className="absolute bottom-[20%] left-[-4%] h-[450px] w-[450px] rounded-full bg-blue-200/14 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[380px] w-[380px] rounded-full bg-amber-200/12 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-30 bg-white/25 backdrop-blur-xl border-b border-white/20">
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

      <div className="relative z-10">
        <ReportView data={data} />
      </div>
    </main>
  );
}
