"use client";

import type { ReportV2 } from "@/lib/v2/types";
import RadarChart from "./radar-chart";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-700">{title}</h2>
    {children}
  </section>
);

export default function ReportViewV2({ report }: { report: ReportV2 }) {
  const t = report.yourType;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-slate-800">
      {/* 1. Header */}
      <header className="mb-8 border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">{report.header.assessmentName}</p>
        <h1 className="text-2xl font-bold">{report.header.name}</h1>
        <p className="text-sm text-slate-500">{report.header.profileId} · {report.header.date}</p>
      </header>

      {/* 2. Your Type */}
      <Section title="Your Type">
        {t.kind === "archetype" ? (
          <div>
            <p className="text-3xl font-extrabold text-slate-900">THE {t.animal.toUpperCase()}</p>
            <p className="mb-2 text-sm italic text-slate-500">{t.rendering.replace(/^\w+ /, "with ")}</p>
            <p className="font-semibold">{t.name}.</p>
            <p className="text-sm text-slate-600">{t.strapline}</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-700">{t.copy}</p>
        )}
      </Section>

      {/* 3. Core Strengths */}
      <Section title="Core Strengths">
        <ul className="space-y-2">
          {report.coreStrengths.map((s) => (
            <li key={s.label} className="text-sm">
              <span className="font-semibold">{s.heading}.</span> {s.sentence}{" "}
              <span className="text-xs text-slate-400">({s.sourceIds.join(", ")})</span>
            </li>
          ))}
        </ul>
      </Section>

      {report.state === "full" ? (
        <>
          {/* 4. Path Fit radar */}
          <Section title="Path Fit"><RadarChart scores={report.radar} /></Section>

          {/* 5. Career cards */}
          <Section title="Career Cards">
            <ol className="space-y-3">
              {report.cards!.map((c, i) => (
                <li key={c.career} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-bold">{i + 1}. {c.career} · {c.fit}% fit</p>
                  <p className="text-sm text-slate-600">{c.whatLine}</p>
                  <p className="mt-1 text-sm"><span className="font-semibold">Next step:</span> {c.nextStep}</p>
                  {c.honestyLine && <p className="mt-1 text-sm italic text-amber-700">{c.honestyLine}</p>}
                </li>
              ))}
            </ol>
          </Section>

          {/* 6. We Feel */}
          {report.verdicts.length > 0 && (
            <Section title="We Feel">
              <ul className="space-y-2">
                {report.verdicts.map((v) => (
                  <li key={v.id} className="text-sm leading-relaxed">{v.line}</li>
                ))}
              </ul>
            </Section>
          )}
        </>
      ) : (
        <Section title="What Happens Next">
          <p className="text-sm text-slate-700">
            No percentages today — they wouldn't be honest. The fastest way forward is below.
          </p>
        </Section>
      )}

      {/* 7. Growth tips */}
      <Section title="Growth Tips">
        <ul className="list-disc space-y-2 pl-5">
          {report.growthTips.map((tip) => <li key={tip} className="text-sm">{tip}</li>)}
        </ul>
      </Section>

      {/* 8. Next steps */}
      <Section title="Next Steps">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>{report.nextSteps.counselling}</li>
          <li>{report.nextSteps.exposure}</li>
          <li>{report.nextSteps.conversation}</li>
          {report.nextSteps.abroad && <li>{report.nextSteps.abroad}</li>}
        </ol>
      </Section>

      {/* 9. Footer */}
      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
        This report reflects what your answers showed about approach and preference. It does not measure
        ability, and no single question decided any line above. · Secure Steps
      </footer>
    </div>
  );
}
