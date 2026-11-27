// "Ask the Gita" as the API route uses it: the Gemini client, the verses and the daily caps,
// set up once per running server from environment variables (all server-only).
//
//   GEMINI_API_KEY (or GOOGLE_API_KEY)  required; without it the section is not shown
//   GITA_MODEL                          model that writes the answers (default in gemini.ts)
//   GITA_EFFORT                         how hard it thinks: low, medium (default) or high
//   GITA_REWRITE                        "off" skips the search-phrase step (see prompts.ts)
//   GITA_DAILY_PER_STUDENT              questions one student may ask per UTC day (default 40; 0 = no cap)
//   GITA_DAILY_TOTAL                    questions from everyone per UTC day (default 2000; 0 = no cap)

import type { GitaReply } from "./chat";
import { isCrisis } from "./crisis";
import verseIndex from "./data/verses.json";
import { GeminiClient } from "./gemini";
import { DailyLimiter, DEFAULT_DAILY_PER_STUDENT, DEFAULT_DAILY_TOTAL, envInt } from "./limiter";
import { chatReply } from "./reply";
import { createVerseStore, type VerseStore } from "./verse-store";

type Env = Record<string, string | undefined>;

/** The Gemini key, under either of the names Google's own tools read. */
export function geminiKey(env: Env = process.env): string {
  return (env.GEMINI_API_KEY ?? "").trim() || (env.GOOGLE_API_KEY ?? "").trim();
}

/** The search-phrase step is on unless GITA_REWRITE says otherwise. */
export function rewriteOn(env: Env = process.env): boolean {
  return !["off", "0", "false", "no"].includes((env.GITA_REWRITE ?? "on").trim().toLowerCase());
}

interface Service {
  client: GeminiClient;
  store: VerseStore;
  limiter: DailyLimiter;
}

let service: Service | null = null;

function getService(): Service | null {
  const key = geminiKey();
  if (!key) return null;
  if (!service) {
    const client = new GeminiClient(key, { model: (process.env.GITA_MODEL ?? "").trim() });
    service = {
      client,
      store: createVerseStore(verseIndex, client.embed),
      limiter: new DailyLimiter(
        envInt(process.env.GITA_DAILY_PER_STUDENT, DEFAULT_DAILY_PER_STUDENT),
        envInt(process.env.GITA_DAILY_TOTAL, DEFAULT_DAILY_TOTAL),
      ),
    };
  }
  return service;
}

/** Is the chat set up on this server? The report shows the section only when it is. */
export function gitaAvailable(): boolean {
  return Boolean(geminiKey());
}

/** The student has used up today's questions (the route answers 429). */
export class OverDailyLimit extends Error {}
/** No Gemini key is set (the route answers 503). */
export class NotConfigured extends Error {}

/**
 * Reply to a conversation for one student. Throws BadConversation, OverDailyLimit or NotConfigured;
 * any other error is a model or network failure.
 */
export async function askGita(messages: unknown, report: unknown, student: string): Promise<GitaReply> {
  const s = getService();
  if (!s) throw new NotConfigured();
  const last = Array.isArray(messages) ? (messages[messages.length - 1] as { content?: unknown } | undefined) : undefined;
  const latest = typeof last?.content === "string" ? last.content : "";
  // A student in crisis always gets the help message, cap or no cap (it calls no model).
  if (!isCrisis(latest) && !s.limiter.allow(student)) throw new OverDailyLimit();
  return chatReply(messages, report, s.store, s.client, { rewrite: rewriteOn(), effort: process.env.GITA_EFFORT });
}
