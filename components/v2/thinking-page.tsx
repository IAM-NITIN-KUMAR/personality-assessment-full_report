"use client";

import { useState } from "react";
import { Check, Compass, FlaskConical, HelpCircle, Layers, MapPin, Quote, Sparkles, Target } from "lucide-react";
import type { ThinkingPage } from "@/lib/v2/fp/thinking";

const BAND_STYLE: Record<ThinkingPage["assumptions"]["band"], string> = {
  Low: "bg-[#e8f8ef] text-green-700",
  Medium: "bg-[#fff4e0] text-amber-700",
  High: "bg-[#fdeaea] text-red-700",
};

function Eyebrow({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-5 rounded-full bg-electric text-white font-mono text-[10.5px] font-black flex items-center justify-center">{n}</span>
      <h3 className="text-[12px] font-black tracking-widest text-ink-700 uppercase">{children}</h3>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-surface-subtle/70 p-4 space-y-1.5">
      <div className="text-[10px] font-bold text-ink-400 font-mono uppercase tracking-wide">{label}</div>
      <div className={`inline-block text-[22px] font-black leading-none ${tone ?? "text-ink"}`}>{value}</div>
      <div className="text-[11.5px] text-ink-500 leading-snug">{sub}</div>
    </div>
  );
}

const CONCLUSION_TITLES = ["Your career route", "Your work environment", "Your next step"];

/** Box 3: the system suggests wording and the student edits it before saving (spec Part D). */
function Conclusions({ t, onSave }: { t: ThinkingPage; onSave?: (texts: string[]) => void }) {
  const [texts, setTexts] = useState<string[]>([...t.conclusions]);
  const [savedTexts, setSavedTexts] = useState<string[] | null>(t.saved ? [...t.conclusions] : null);
  const dirty = !savedTexts || texts.some((x, i) => x.trim() !== savedTexts[i]);
  const ready = texts.every((x) => x.trim().length > 10);

  const save = () => {
    const clean = texts.map((x) => x.trim());
    setTexts(clean);
    setSavedTexts(clean);
    onSave?.(clean);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Eyebrow n={3}>Your three conclusions</Eyebrow>
        <span className="text-[10px] font-mono font-bold text-ink-400 uppercase">
          {!dirty ? "Saved in your own words" : onSave ? "Suggested wording: edit it to sound like you, then save" : "Suggested wording: edit it to sound like you"}
        </span>
      </div>
      <div className="space-y-3">
        {texts.map((c, i) => (
          <label key={i} className="relative block rounded-[16px] border border-electric/25 bg-gradient-to-br from-electric-tint to-white p-5 pl-12">
            <Quote className="absolute left-4 top-5 size-5 text-electric/50" />
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-electric mb-1">{CONCLUSION_TITLES[i]}</span>
            {onSave ? (
              <textarea
                value={c}
                onChange={(e) => setTexts((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                rows={3}
                className="w-full resize-y bg-transparent text-[14.5px] sm:text-[15px] font-semibold leading-relaxed text-ink-700 outline-none"
              />
            ) : (
              <p className="text-[14.5px] sm:text-[15px] font-semibold leading-relaxed text-ink-700">{c}</p>
            )}
          </label>
        ))}
      </div>
      {onSave && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-ink-400">Your coach will ask &ldquo;why&rdquo; up to five times on each one, so write what you really think.</p>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || !ready}
            className="inline-flex items-center gap-1.5 rounded-full bg-electric px-4 py-2 text-[12.5px] font-bold text-white transition-opacity disabled:opacity-40"
          >
            <Check className="size-4" /> {dirty ? "Save my conclusions" : "Saved"}
          </button>
        </div>
      )}
      <p className="text-[12px] text-ink-500 flex items-start gap-2"><Compass className="size-4 shrink-0 text-electric mt-0.5" /> Next step in plain words: {t.gap.next}</p>
    </section>
  );
}

export function ThinkingPageView({ t, onSaveConclusions }: { t: ThinkingPage; onSaveConclusions?: (texts: string[]) => void }) {
  const { byGroup } = t.assumptions;
  return (
    <div className="space-y-8">
      <header className="space-y-2 max-w-2xl">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-electric">First principles</div>
        <h2 className="text-[26px] sm:text-[32px] font-black leading-tight text-ink">How you are thinking about your next step</h2>
        <p className="text-[13.5px] leading-relaxed text-ink-500">
          Your roots are the facts about you. Your route is rebuilt from them, not borrowed from family, friends or trends.
          This page sets what you assumed against what your results show.
        </p>
      </header>

      {/* Clarity snapshot */}
      <section className="grid sm:grid-cols-3 gap-3">
        <Stat label="Starting confidence" value={`${t.confidence.average.toFixed(1)} / 5`} sub={`Career ${t.confidence.career} · Workplace ${t.confidence.workplace} · Next step ${t.confidence.next}`} tone="text-electric" />
        <Stat label="Assumption load" value={t.assumptions.band} sub={`${t.assumptions.total} of 12 beliefs worth testing (${byGroup.career.flags}/${byGroup.career.of} route · ${byGroup.work.flags}/${byGroup.work.of} setting · ${byGroup.next.flags}/${byGroup.next.of} next step)`} tone={BAND_STYLE[t.assumptions.band].split(" ")[1]} />
        <Stat label="After your coach session" value="___ / 5" sub="Re-rate your confidence together and see how far it moved." />
      </section>

      {/* Box 1 */}
      <section className="space-y-3">
        <Eyebrow n={1}>Where you started</Eyebrow>
        <p className="rounded-[16px] border border-line bg-white p-5 text-[14.5px] leading-relaxed text-ink-700">{t.started}</p>
        {t.assumptions.reasonNotes.map((n) => (
          <div key={n.group} className="rounded-[12px] border border-amber-200 bg-[#fffaf0] px-4 py-3 text-[12.5px] text-amber-800 leading-relaxed">
            <span className="font-bold">{n.label}: </span>{n.text}
          </div>
        ))}
      </section>

      {/* Box 2 */}
      <section className="space-y-3">
        <Eyebrow n={2}>What you assumed, and what your results show</Eyebrow>
        {t.rows.length === 0 ? (
          <p className="rounded-[16px] border border-line bg-surface-subtle/60 p-5 text-[13.5px] text-ink-600 leading-relaxed">
            Your current thinking already rests on your own reasons. The next step is to test it in the real world.
          </p>
        ) : (
          <div className="rounded-[16px] border border-line overflow-hidden bg-white">
            <div className="hidden sm:grid grid-cols-3 bg-electric-tint text-[10px] font-mono font-bold uppercase tracking-wider text-electric">
              <div className="px-4 py-2">What you believed</div>
              <div className="px-4 py-2">What your results show</div>
              <div className="px-4 py-2">A question to explore</div>
            </div>
            {t.rows.map((r, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-px sm:gap-0 border-t border-line/60 text-[12.5px] leading-relaxed">
                <div className="px-4 py-3 text-ink-700 font-semibold">&ldquo;{r.belief}&rdquo;</div>
                <div className="px-4 py-3 text-ink-600">{r.evidence}</div>
                <div className="px-4 py-3 text-electric-700 italic">{r.question}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Route rebuilt from the facts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-full bg-electric-tint flex items-center justify-center text-electric"><Layers className="size-3.5" strokeWidth={3} /></div>
          <h3 className="text-[12px] font-black tracking-widest text-ink-700 uppercase">Your route, rebuilt from the facts</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {t.routes.map((r, i) => (
            <div key={r.career} className="rounded-[14px] border border-line bg-surface-subtle/70 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-ink-400 uppercase">Match {i + 1}</span>
                {r.isNew && <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md bg-electric text-white">NEW TO YOU</span>}
              </div>
              <div className="text-[15px] font-extrabold text-ink leading-tight">{r.career}</div>
              <div className="text-[11px] text-ink-400">{r.domain}</div>
              <div className="flex flex-wrap gap-1">
                {r.matched.map((m) => <span key={m} className="text-[10px] rounded-full bg-electric-tint text-electric px-2 py-0.5 font-semibold">{m}</span>)}
              </div>
            </div>
          ))}
        </div>
        {t.combined && <p className="text-[12.5px] text-ink-600 leading-relaxed rounded-[12px] bg-surface-subtle border border-line px-4 py-3">{t.combined}</p>}

        <div className="rounded-[16px] border border-line bg-white p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[13px] font-extrabold text-ink">Your best environment: <span className="text-electric">{t.environment.description}</span></div>
            {t.environment.focus.length > 0 && <div className="text-[11.5px] text-ink-400">Most enjoy working with {t.environment.focus.join(" and ")}</div>}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {t.environment.dials.map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-[10px] text-ink-400"><span>{d.left}</span><span className="text-right">{d.right}</span></div>
                <div className="relative h-1.5 bg-line/60 rounded-full">
                  <div className="absolute top-1/2 size-3 rounded-full bg-electric border-2 border-white shadow -translate-y-1/2 -translate-x-1/2" style={{ left: `${((d.value - 1) / 4) * 100}%` }} />
                </div>
                <div className="text-[10.5px] font-bold text-ink-500">{d.label}</div>
              </div>
            ))}
          </div>
          {t.environment.comparison && <p className="text-[12.5px] text-ink-600 border-t border-line/60 pt-3">{t.environment.comparison}</p>}
        </div>
      </section>

      {/* Box 3 */}
      <Conclusions t={t} onSave={onSaveConclusions} />

      {/* Box 4 + 5 */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Eyebrow n={4}>Your small tests · next 30 days</Eyebrow>
          </div>
          {[t.tests.route, t.tests.environment, t.tests.next].map((x, i) => (
            <div key={i} className="flex gap-3 items-start rounded-[14px] border border-line bg-white p-3.5">
              <div className="size-7 rounded-lg bg-[#e8f8ef] text-green-700 flex items-center justify-center shrink-0">{[<Target key="a" className="size-4" />, <MapPin key="b" className="size-4" />, <FlaskConical key="c" className="size-4" />][i]}</div>
              <p className="text-[12.5px] text-ink-600 leading-relaxed">{x}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Eyebrow n={5}>Questions to bring to your coach</Eyebrow>
          {t.questions.map((q, i) => (
            <div key={i} className="flex gap-3 items-start rounded-[14px] border border-line bg-white p-3.5">
              <HelpCircle className="size-5 shrink-0 text-electric" />
              <p className="text-[12.5px] text-ink-600 leading-relaxed">{q}</p>
            </div>
          ))}
          <div className="rounded-[14px] border border-dashed border-line p-3.5 text-[12px] text-ink-300 flex gap-2 items-start">
            <Sparkles className="size-4 shrink-0" /> Your own question: ______________________________
          </div>
        </div>
      </section>
    </div>
  );
}
