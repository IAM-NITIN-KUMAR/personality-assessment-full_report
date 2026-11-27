"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Quote, RotateCcw, Send } from "lucide-react";
import type { ReportV2 } from "@/lib/v2/types";
import type { ReportData } from "@/lib/report-data";
import { gitaLegacyStarters, gitaLegacySummary, gitaReportSummary, gitaStarters } from "@/lib/v2/gita/report-summary";
import type { GitaReportSummary } from "@/lib/v2/gita/report-summary";
import { answerBlocks, helpParts, questionBlocks, toGitaReply, unquotedSources } from "@/lib/v2/gita/chat";
import type { GitaReply, GitaTurn, QuestionBlock } from "@/lib/v2/gita/chat";

// "Still unsure? Ask the Gita": the last section of the web report. The student
// asks in their own words; the Gita chat service answers from verses only, with
// this student's report as background. It is shown only while the service is
// reachable, so a report never carries a dead chat box. Not part of the PDF.

const MAX_TURNS_SENT = 24; // the service accepts 40 and reads the last 12
const MAX_QUESTION_CHARS = 2000;

type Item =
  | { id: number; from: "student"; text: string }
  | { id: number; from: "gita"; reply: GitaReply }
  | { id: number; from: "notice"; text: string };

const NOTICE: Record<string, string> = {
  too_long: "That question is too long to send. Shorten it and ask again.",
  limit: "You have reached today's limit of questions. Come back tomorrow, or bring what is left to your counselling session.",
  failed: "Your question was not answered because the Gita chat did not respond. It is back in the box below, so you can ask again in a moment.",
};

function toTurns(items: Item[]): GitaTurn[] {
  return items.flatMap<GitaTurn>((it) =>
    it.from === "student"
      ? [{ role: "user", content: it.text }]
      : it.from === "gita"
        ? [{ role: "assistant", content: it.reply.text, kind: it.reply.kind }]
        : [],
  );
}

/** Same tag the report uses for "% FIT", carrying a verse reference. */
function VerseTag({ verse }: { verse: string }) {
  return (
    <span className="text-[9px] font-mono font-black text-electric bg-electric-tint px-2 py-0.5 rounded-md whitespace-nowrap uppercase">
      {verse}
    </span>
  );
}

const BUBBLE = "max-w-[92%] rounded-[16px] rounded-bl-[6px] border border-line bg-surface-subtle/70 p-4";

function Answer({ reply }: { reply: GitaReply }) {
  const blocks = answerBlocks(reply.text);
  const rest = unquotedSources(blocks, reply.sources);
  return (
    <div className={`${BUBBLE} space-y-3`}>
      {blocks.map((b, i) =>
        b.type === "verse" ? (
          <blockquote key={i} className="border-l-2 border-electric/40 pl-3.5 space-y-1.5">
            <p className="text-[13.5px] font-medium italic leading-relaxed text-ink-700">{b.text}</p>
            <VerseTag verse={b.ref} />
          </blockquote>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-700">{b.text}</p>
        ),
      )}
      {rest.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-3">
          <span className="mr-1 text-[10px] font-bold text-ink-400 font-mono uppercase tracking-wide">Verses used</span>
          {rest.map((s) => <VerseTag key={s} verse={s} />)}
        </div>
      )}
    </div>
  );
}

function ClarifyingQuestion({ reply, open, onPick }: { reply: GitaReply; open: boolean; onPick: (text: string) => void }) {
  // Consecutive options are grouped so they read as one set of choices.
  const groups: (QuestionBlock | QuestionBlock[])[] = [];
  for (const b of questionBlocks(reply.text)) {
    const last = groups[groups.length - 1];
    if (b.type === "option" && Array.isArray(last)) last.push(b);
    else groups.push(b.type === "option" ? [b] : b);
  }
  return (
    <div className={`${BUBBLE} space-y-2.5`}>
      {groups.map((g, i) =>
        Array.isArray(g) ? (
          <div key={i} className="space-y-2">
            {g.map((o) => (
              <button
                key={o.text}
                type="button"
                disabled={!open}
                onClick={() => onPick(o.text)}
                className="block w-full rounded-[12px] border border-electric/25 bg-electric-tint/60 px-3.5 py-2.5 text-left text-[12.5px] font-semibold text-ink-700 transition-colors hover:bg-electric-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:opacity-50 disabled:hover:bg-electric-tint/60"
              >
                {o.text}
              </button>
            ))}
          </div>
        ) : (
          <p key={i} className="text-[13.5px] leading-relaxed text-ink-700">{g.text}</p>
        ),
      )}
    </div>
  );
}

/** A student in distress gets real help, set apart from everything else in the section. */
function Help({ reply }: { reply: GitaReply }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[16px] bg-ink p-5 text-white">
      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <Phone className="size-4" />
      </div>
      <p className="text-[14.5px] leading-relaxed">
        {helpParts(reply.text).map((p, i) =>
          p.type === "phone" ? (
            <a key={i} href={`tel:${p.number}`} className="font-extrabold underline decoration-electric underline-offset-2">
              {p.number}
            </a>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-[92%] rounded-[12px] border border-line bg-surface-subtle px-4 py-3 space-y-1">
      <p className="text-[12.5px] leading-relaxed text-ink-700">I could not find verses that speak to this.</p>
      <p className="text-[12px] leading-relaxed text-ink-500">
        Try saying it another way: a sentence or two about what is worrying you works best.
      </p>
    </div>
  );
}

/** For the college (v2) report. */
export function GitaChatSection({ report }: { report: ReportV2 }) {
  const summary = useMemo(() => gitaReportSummary(report), [report]);
  const starters = useMemo(() => gitaStarters(report), [report]);
  return <GitaChat summary={summary} starters={starters} />;
}

/** For the school (classes 10 to 12) report. */
export function GitaChatSectionLegacy({ data }: { data: ReportData }) {
  const summary = useMemo(() => gitaLegacySummary(data), [data]);
  const starters = useMemo(() => gitaLegacyStarters(data), [data]);
  return <GitaChat summary={summary} starters={starters} />;
}

function GitaChat({ summary, starters }: { summary: GitaReportSummary; starters: string[] }) {
  const [service, setService] = useState<"checking" | "ready" | "off">("checking");
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    let live = true;
    fetch("/api/gita", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { available?: boolean }) => live && setService(d.available ? "ready" : "off"))
      .catch(() => live && setService("off"));
    return () => {
      live = false;
    };
  }, []);

  // Keep the newest turn in view once a conversation is under way (never on first load).
  useEffect(() => {
    if (items.length > 0) endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [items, busy]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const ask = async (text: string) => {
    const question = text.trim().slice(0, MAX_QUESTION_CHARS);
    if (!question || busy) return;
    const typed = text === draft;
    const mine: Item = { id: nextId.current++, from: "student", text: question };
    const thread = [...items.filter((it) => it.from !== "notice"), mine];
    setItems(thread);
    if (typed) setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/gita", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: toTurns(thread).slice(-MAX_TURNS_SENT), report: summary }),
      });
      if (!res.ok) throw new Error(res.status === 413 ? "too_long" : res.status === 429 ? "limit" : "failed");
      const reply = toGitaReply(await res.json());
      setItems((cur) => [...cur, { id: nextId.current++, from: "gita", reply }]);
    } catch (e) {
      const why = e instanceof Error && e.message in NOTICE ? e.message : "failed";
      // Take the unanswered question back out so the thread matches what the service has seen.
      setItems((cur) => [
        ...cur.filter((it) => it.id !== mine.id),
        { id: nextId.current++, from: "notice", text: NOTICE[why] },
      ]);
      setDraft(question);
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    if (busy) return;
    setItems([]);
    setDraft("");
  };

  if (service === "checking") return null;
  // Students never see a chat that cannot answer. In development the reason is spelled out instead.
  if (service === "off" && process.env.NODE_ENV === "production") return null;

  const lastId = items[items.length - 1]?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-line rounded-[24px] shadow-2xl p-4 sm:p-8 md:p-12 text-ink relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 bg-electric-tint text-electric font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] z-10 border-b border-l border-line/50 shadow-sm">
        ONLINE ONLY
      </div>

      <div className="space-y-6">
        <header className="space-y-2 max-w-2xl pt-4 sm:pt-0">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-electric">Still unsure?</div>
          <h2 className="text-[26px] sm:text-[32px] font-black leading-tight text-ink">Ask the Gita</h2>
          <p className="text-[13.5px] leading-relaxed text-ink-500">
            Your report shows where your answers point. If a doubt is still sitting with you, put it into words
            here. Each answer is drawn from verses of the Bhagavad Gita and names the verses it uses.
          </p>
        </header>

        {service === "off" ? (
          <div className="rounded-[12px] border border-amber-200 bg-[#fffaf0] px-4 py-3 text-[12.5px] text-amber-800 leading-relaxed">
            <span className="font-bold">Developer note: </span>
            no Gemini key is set, so students would not see this section at all. Add{" "}
            <code className="font-mono">GEMINI_API_KEY</code> to <code className="font-mono">.env.local</code> and
            restart the server.
          </div>
        ) : (
          <>
            {items.length === 0 && (
              <div className="space-y-5">
                <figure className="relative rounded-[16px] border border-electric/25 bg-gradient-to-br from-electric-tint to-white p-5 pl-12">
                  <Quote className="absolute left-4 top-5 size-5 text-electric/50" />
                  <blockquote className="text-[14.5px] sm:text-[15px] font-semibold leading-relaxed text-ink-700">
                    My heart is oppressed with pity; and my mind confused as to what my duty is.
                  </blockquote>
                  <figcaption className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-500">
                    <VerseTag verse="Gita 2.7" />
                    <span>Arjuna says this before the teaching begins. He did not know what to do either.</span>
                  </figcaption>
                </figure>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-ink-400 font-mono uppercase tracking-wide">
                    You could start with
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {starters.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => ask(s)}
                        className="rounded-[14px] border border-line bg-white px-3.5 py-2 text-left text-[12.5px] font-semibold text-ink-700 transition-colors hover:border-electric/40 hover:bg-electric-tint/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div role="log" aria-live="polite" aria-label="Your conversation" className="space-y-3">
                {items.map((it) =>
                  it.from === "student" ? (
                    <div key={it.id} className="flex justify-end">
                      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[16px] rounded-br-[6px] bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed text-white">
                        <span className="sr-only">You asked: </span>
                        {it.text}
                      </p>
                    </div>
                  ) : it.from === "notice" ? (
                    <div key={it.id} className="rounded-[12px] border border-amber-200 bg-[#fffaf0] px-4 py-3 text-[12.5px] text-amber-800 leading-relaxed">
                      {it.text}
                    </div>
                  ) : it.reply.kind === "answer" ? (
                    <Answer key={it.id} reply={it.reply} />
                  ) : it.reply.kind === "question" ? (
                    <ClarifyingQuestion key={it.id} reply={it.reply} open={!busy && it.id === lastId} onPick={ask} />
                  ) : it.reply.kind === "chat" ? (
                    <div key={it.id} className={BUBBLE}>
                      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-700">{it.reply.text}</p>
                    </div>
                  ) : it.reply.kind === "crisis" ? (
                    <Help key={it.id} reply={it.reply} />
                  ) : (
                    <NotFound key={it.id} />
                  ),
                )}
                {busy && (
                  <div className="inline-flex items-center gap-2.5 rounded-[16px] rounded-bl-[6px] border border-line bg-surface-subtle/70 px-4 py-3">
                    <span className="flex gap-1" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-electric animate-pulse motion-reduce:animate-none"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </span>
                    <span className="text-[12.5px] text-ink-500">Looking through the verses</span>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex items-end gap-2 rounded-[18px] border border-line bg-white p-2 pl-4 transition-shadow focus-within:border-electric/50 focus-within:ring-4 focus-within:ring-electric/10"
            >
              <label htmlFor={inputId} className="sr-only">Your question</label>
              <textarea
                id={inputId}
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_QUESTION_CHARS}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    ask(draft);
                  }
                }}
                placeholder="What is on your mind?"
                className="min-h-[40px] max-h-[140px] flex-1 resize-none bg-transparent py-2 text-[16px] sm:text-[14px] leading-relaxed text-ink-700 outline-none placeholder:text-ink-300"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-electric px-4 py-2.5 text-[12.5px] font-bold text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 disabled:opacity-40"
              >
                <Send className="size-4" /> Ask
              </button>
            </form>

            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <p className="max-w-xl text-[11.5px] leading-relaxed text-ink-400">
                Verses are quoted from Shri Purohit Swami&apos;s 1935 translation. This is for reflection; it is not
                counselling or medical advice. Your name and contact details are not sent.
              </p>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={startOver}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-500 transition-colors hover:text-ink disabled:opacity-40"
                >
                  <RotateCcw className="size-3.5" /> Start over
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
