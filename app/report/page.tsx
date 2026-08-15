"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Share2, LogOut } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { ReportView } from "@/components/report-view";
import { Button } from "@/components/ui/button";
import { buildReport } from "@/lib/report-data";
import { toV2Answers } from "@/components/v2/assessment-flow";
import { buildReportV2 } from "@/lib/v2/report";
import { ANANYA_ANSWERS, ANANYA_NAME } from "@/lib/v2/fixtures";
import ReportViewV2 from "@/components/v2/report-view";

export default function ReportPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const profile = useAssessment((s) => s.profile);
  const archetype = useAssessment((s) => s.archetype);
  const answers = useAssessment((s) => s.answers);
  const allQuestions = useAssessment((s) => s.allQuestions);
  const computeArchetype = useAssessment((s) => s.computeArchetype);

  // College (and any profile missing an education level, which defaults to college
  // throughout the app) gets the v2 9-block report. School (10th_12th) keeps the
  // legacy report below, untouched. Same condition as app/assessment/page.tsx.
  const isV2 = profile?.educationLevel !== "10th_12th";

  // Lazy-recompute if missing (e.g. user lands here directly via persisted state).
  // Only relevant to the legacy (school) report — v2 doesn't use this archetype.
  useEffect(() => {
    if (hydrated && profile && !archetype && !isV2) computeArchetype();
  }, [hydrated, profile, archetype, computeArchetype, isV2]);

  const isMock = typeof window !== "undefined" && window.location.search.includes("mock=true");

  // Redirect from effect, never during render.
  useEffect(() => {
    if (hydrated && !profile) {
      if (!isMock) {
        router.replace("/");
      }
    }
  }, [hydrated, profile, isMock, router]);

  const mockData = useMemo(() => {
    return buildReport({
      profile: {
        name: "Riya Mehta",
        email: "riya@example.com",
        discipline: "tech_cs",
        course: "bca",
      },
      archetype: {
        name: "The Builder",
        tagline: "You build systems, products, and solutions.",
        description: "You thrive when converting ideas into tangible, working systems.",
        scores: [
          { dimension: "decision_style", raw: 5, normalized: 50 },
          { dimension: "energy", raw: -2, normalized: -20 },
          { dimension: "structure", raw: 8, normalized: 80 },
          { dimension: "risk", raw: 4, normalized: 40 },
          { dimension: "social", raw: -3, normalized: -30 },
          { dimension: "drive", raw: 6, normalized: 60 },
        ],
      },
      questions: [],
      answers: {},
    });
  }, []);

  const data = useMemo(() => {
    if (!profile || !archetype) {
      return isMock ? mockData : null;
    }
    return buildReport({
      profile,
      archetype,
      questions: allQuestions(),
      answers,
    });
  }, [profile, archetype, answers, allQuestions, mockData, isMock]);

  // v2 (college) report — built independently of the legacy `data` above.
  const v2Answers = isMock ? ANANYA_ANSWERS : toV2Answers(answers);
  const reportV2 = useMemo(
    () =>
      buildReportV2({
        name: isMock ? ANANYA_NAME : profile?.name ?? "Student",
        email: profile?.email,
        dateISO: new Date().toISOString().slice(0, 10),
        answers: v2Answers,
      }),
    [isMock, profile, v2Answers],
  );

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

  const [downloadingV2, setDownloadingV2] = useState(false);

  const handleDownloadV2 = async () => {
    setDownloadingV2(true);
    try {
      const [{ pdf }, { default: ReportPdfV2 }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/v2/report-pdf"),
      ]);
      const blob = await pdf(<ReportPdfV2 report={reportV2} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roots-and-routes-${reportV2.header.profileId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingV2(false);
    }
  };

  const handleEndSession = () => {
    const ok = confirm(
      "End this session?\n\nMake sure you've downloaded your PDF — your answers will be cleared from this device.",
    );
    if (!ok) return;
    router.push("/thank-you");
  };

  if (!hydrated || (!profile && !isMock)) return null;

  // v2 (college) branch — 9-block report with its own PDF export (lib/v2/report-pdf.tsx).
  if (isV2) {
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-4">
            <Button variant="ghost" onClick={() => router.push("/assessment")}>
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <div className="mono-eyebrow text-ink-700 flex items-center gap-2 truncate max-w-[120px] sm:max-w-none">
              <span className="active-dot shrink-0" />
              <span className="truncate">REPORT · {reportV2.header.name.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button variant="outline" className="hidden sm:inline-flex" disabled title="Sharing coming soon">
                <Share2 className="h-3 w-3" />
                Share
              </Button>
              <Button variant="solid" onClick={handleDownloadV2} disabled={downloadingV2}>
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">{downloadingV2 ? "Generating…" : "Download PDF"}</span>
                <span className="inline sm:hidden">{downloadingV2 ? "…" : "PDF"}</span>
              </Button>
              <Button variant="ghost" onClick={handleEndSession} title="End session and return home">
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">End session</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          <ReportViewV2 report={reportV2} />
        </div>
      </main>
    );
  }

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => router.push("/assessment")}>
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>
          <div className="mono-eyebrow text-ink-700 flex items-center gap-2 truncate max-w-[120px] sm:max-w-none">
            <span className="active-dot shrink-0" />
            <span className="truncate">REPORT · {data.profile.name.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" className="hidden sm:inline-flex" disabled title="Sharing coming soon">
              <Share2 className="h-3 w-3" />
              Share
            </Button>
            <Button variant="solid" onClick={handleDownload} disabled={downloading}>
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">{downloading ? "Generating…" : "Download PDF"}</span>
              <span className="inline sm:hidden">{downloading ? "…" : "PDF"}</span>
            </Button>
            <Button variant="ghost" onClick={handleEndSession} title="End session and return home">
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">End session</span>
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
