// Writes the reply to the latest message of an "Ask the Gita" conversation.
//
// The grounding rules: the model sees only verses found for this message, every answer must
// cite verses it was given, and a self-harm signal short-circuits to the help message. The
// model may also ask one short clarifying question (marked [[ASK]]) when a message is too
// vague, or reply to small talk in a line or two (marked [[CHAT]]). Anything that breaks a
// rule is replaced by the not-found sentence, so an unchecked reply never reaches a student.
//
// Nothing is remembered between requests: the caller sends the whole conversation each time.
// The model and the verse search are passed in, so tests use fakes and never touch the network.

import type { GitaReply, GitaTurn } from "./chat";
import { isCrisis } from "./crisis";
import { TOTAL_BUDGET_MS, type ModelClient, type ModelMessage } from "./gemini";
import {
  ASK_MARKER,
  ASK_REMINDER,
  CHAT_MARKER,
  CHAT_REMINDER,
  CHAT_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT_NO_ASK,
  CRISIS_MESSAGE,
  CRISIS_SENTINEL,
  NO_PHRASE,
  NOT_FOUND,
  PHRASE_SYSTEM_PROMPT,
} from "./prompts";
import { renderReport } from "./report-text";
import type { Hit, VerseStore } from "./verse-store";

export const DEFAULT_K = 5;
// Cosine distance. 1.0 filters nothing out with the current embedding model (the closest verse to
// any question sits well under 0.5), which matches how the service has always behaved.
export const DEFAULT_MAX_DISTANCE = 1.0;
// The cap covers the model's own reasoning as well as the answer, so it is set well above
// the ~120-word answer to avoid cut-offs.
export const MAX_TOKENS = 8000;
export const DEFAULT_EFFORT = "medium";
const EFFORTS = ["low", "medium", "high", "xhigh", "max"];

export const MAX_CLARIFYING = 2; // clarifying questions allowed per conversation
export const MAX_TURNS = 12; // most recent turns sent to the model
export const MAX_CONTENT_CHARS = 2000; // per turn
export const MAX_REPORT_CHARS = 4000; // rendered report
export const MAX_QUESTION_CHARS = 400; // a clarifying question longer than this is rejected
export const MAX_CHAT_CHARS = 300; // small talk longer than this is rejected: it must not turn into uncited advice
const QUERY_USER_TURNS = 3; // recent user messages joined into the search query

export const MAX_PHRASE_CHARS = 300;
const PHRASE_MAX_TOKENS = 1000;
const PHRASE_REPORT_CHARS = 1500;
const PHRASE_TURNS = 6;
export const EXTRA_HITS = 3; // verses kept from the search on the student's own words, beside the phrase's

// One reply has to fit inside the route's time limit (60 seconds). The search phrase is a
// nicety, so it gets a short share; the answer gets what is left.
const REPLY_BUDGET_MS = 52_000;
const PHRASE_BUDGET_MS = 12_000;

/** The conversation itself is malformed (the route answers 400). */
export class BadConversation extends Error {}

/** A turn after trimming, as used inside this module. */
interface Turn {
  role: "user" | "assistant";
  content: string;
  kind?: string;
}

// Digits in any script count, so a reference written in Devanagari numerals is still seen as a
// citation (and then rejected, because no supplied verse is labelled that way).
const CITATION = /Gita\s+(\p{Nd}+)[.:](\p{Nd}+)/giu;

/** The first `max` characters of a text, never cutting an emoji in half. */
const clip = (text: string, max: number) => (text.length <= max ? text : [...text].slice(0, max).join(""));

/** Stop text from opening or closing a tag in the prompt. */
const escapeTags = (text: string) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** References cited in a text, each once, in the order they appear, as "Gita 2.47". */
export function citedRefs(text: string): string[] {
  return [...new Set([...text.matchAll(CITATION)].map((m) => `Gita ${m[1]}.${m[2]}`))];
}

/** GITA_EFFORT when it names a valid level, else the default. */
export function effortFrom(value: string | undefined): string {
  const chosen = (value ?? "").trim().toLowerCase();
  return EFFORTS.includes(chosen) ? chosen : DEFAULT_EFFORT;
}

/** The final user message: tagged verses, the tagged question, and the grounding reminder. */
export function buildPrompt(question: string, hits: Hit[]): string {
  const verses = hits
    .map(({ verse }) => `<verse ref="${escapeTags(verse.ref).replace(/"/g, "&quot;")}">${escapeTags(verse.text)}</verse>`)
    .join("\n");
  return (
    `<verses>\n${verses}\n</verses>\n\n` +
    `<question>${escapeTags(question)}</question>\n\n` +
    "Answer using only the verses above, and cite each one you use by its reference. " +
    `If these verses do not address the question, your entire reply must be exactly: ${NOT_FOUND}`
  );
}

/**
 * The latest message restated for the verse search, or null when the model declines or anything
 * goes wrong; the caller then searches with the student's own words alone.
 */
export async function searchPhrase(
  turns: Turn[],
  reportText: string,
  client: ModelClient,
  budgetMs: number = PHRASE_BUDGET_MS,
): Promise<string | null> {
  const earlier = turns
    .slice(-PHRASE_TURNS, -1)
    .filter((t) => !(t.role === "assistant" && t.kind === "not_found"))
    .map((t) => {
      const tag = t.role === "user" ? "student" : "assistant";
      return `<${tag}>${escapeTags(t.content)}</${tag}>`;
    })
    .join("\n");
  const parts: string[] = [];
  if (reportText) parts.push(`<report>\n${escapeTags(clip(reportText, PHRASE_REPORT_CHARS))}\n</report>`);
  if (earlier) parts.push(`<conversation>\n${earlier}\n</conversation>`);
  parts.push(`<latest>${escapeTags(turns[turns.length - 1].content)}</latest>`);
  parts.push("Write the search phrase for the latest message.");

  let response;
  try {
    response = await client.create({
      maxTokens: PHRASE_MAX_TOKENS,
      effort: "low",
      system: PHRASE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: parts.join("\n\n") }],
      budgetMs,
    });
  } catch (e) {
    // The answer call that follows will surface a real outage.
    console.warn(`search phrase skipped: ${e instanceof Error ? e.constructor.name : "error"}`);
    return null;
  }
  if (response.stopReason === "max_tokens" || response.stopReason === "refusal") return null;
  const phrase = response.text.split(/\s+/).filter(Boolean).join(" ");
  if (!phrase || phrase.toUpperCase().startsWith(NO_PHRASE) || phrase.length > MAX_PHRASE_CHARS) return null;
  if ([CRISIS_SENTINEL, ASK_MARKER, CHAT_MARKER, "<", ">"].some((marker) => phrase.includes(marker))) return null;
  return phrase;
}

/** Hits from several searches as one list: each verse once, at its closest distance, nearest first. */
function mergeHits(groups: Hit[][], limit: number): Hit[] {
  const best = new Map<string, Hit>();
  for (const group of groups) {
    for (const hit of group) {
      const seen = best.get(hit.verse.ref);
      if (!seen || hit.distance < seen.distance) best.set(hit.verse.ref, hit);
    }
  }
  return [...best.values()].sort((a, b) => a.distance - b.distance).slice(0, limit);
}

function validated(messages: unknown): GitaTurn[] {
  if (!Array.isArray(messages) || messages.length === 0) throw new BadConversation("messages must be a non-empty list");
  for (const m of messages) {
    if (typeof m !== "object" || m === null || Array.isArray(m)) throw new BadConversation("each message must be an object");
    const { role, content } = m as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") throw new BadConversation("message role must be 'user' or 'assistant'");
    if (typeof content !== "string") throw new BadConversation("message content must be a string");
  }
  const last = messages[messages.length - 1] as GitaTurn;
  if (last.role !== "user" || !last.content.trim()) throw new BadConversation("the last message must be a non-blank user message");
  return messages as GitaTurn[];
}

/** Non-blank turns, content capped, the last MAX_TURNS, starting with a user turn. */
function recentTurns(messages: GitaTurn[]): Turn[] {
  const turns: Turn[] = messages
    .filter((m) => m.content.trim())
    .map((m) => ({
      role: m.role,
      content: clip(m.content.trim(), MAX_CONTENT_CHARS),
      kind: typeof m.kind === "string" ? m.kind : undefined,
    }))
    .slice(-MAX_TURNS);
  while (turns[0].role !== "user") turns.shift();
  return turns;
}

/** Join consecutive same-role messages so roles alternate. */
function mergeSameRole(parts: ModelMessage[]): ModelMessage[] {
  const merged: ModelMessage[] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last && last.role === p.role) last.content += "\n\n" + p.content;
    else merged.push({ ...p });
  }
  return merged;
}

const notFound = (): GitaReply => ({ kind: "not_found", text: NOT_FOUND, sources: [] });
const crisis = (): GitaReply => ({ kind: "crisis", text: CRISIS_MESSAGE, sources: [] });

export interface ReplyOptions {
  k?: number;
  maxDistance?: number;
  /** Ask the model for a search phrase first (see prompts.ts). One extra, small model call per message. */
  rewrite?: boolean;
  /** How hard the model thinks before answering: low, medium or high. */
  effort?: string;
  /** Milliseconds from any fixed point; only differences are used. */
  clock?: () => number;
}

/** Reply to the latest user turn of a conversation (oldest turn first). Throws BadConversation for a malformed one. */
export async function chatReply(
  rawMessages: unknown,
  report: unknown,
  store: VerseStore,
  client: ModelClient,
  options: ReplyOptions = {},
): Promise<GitaReply> {
  const { k = DEFAULT_K, maxDistance = DEFAULT_MAX_DISTANCE, rewrite = false, clock = () => performance.now() } = options;
  const started = clock();
  const messages = validated(rawMessages);
  if (isCrisis(messages[messages.length - 1].content)) return crisis();

  const asked = messages.filter((m) => m.role === "assistant" && m.kind === "question").length;
  const mayAsk = asked < MAX_CLARIFYING;
  const turns = recentTurns(messages);
  const latest = turns[turns.length - 1].content;

  // A follow-up like "the second one" finds the wrong verses alone, so recent user messages
  // go in together. The report is deliberately left out of the search.
  const query = turns
    .filter((t) => t.role === "user")
    .map((t) => t.content)
    .slice(-QUERY_USER_TURNS)
    .join("\n");
  const reportText = clip(renderReport(report), MAX_REPORT_CHARS).trim();
  const phrase = rewrite ? await searchPhrase(turns, reportText, client) : null;
  const found = phrase
    ? mergeHits(await Promise.all([store.search(phrase, k), store.search(query, EXTRA_HITS)]), k + EXTRA_HITS)
    : await store.search(query, k);
  const hits = found.filter((hit) => hit.distance <= maxDistance);
  if (hits.length === 0) return notFound();

  let final = buildPrompt(latest, hits) + "\n\n" + CHAT_REMINDER;
  if (mayAsk) final += "\n\n" + ASK_REMINDER;
  if (reportText) final = `<report>\n${escapeTags(reportText)}\n</report>\n\n${final}`;

  const parts: ModelMessage[] = [];
  for (const t of turns.slice(0, -1)) {
    if (t.role === "assistant" && t.kind === "not_found") continue; // it says nothing, and seeing it invites the model to repeat it
    let content: string;
    if (t.role === "user") content = `<question>${escapeTags(t.content)}</question>`;
    // Shown the way the model wrote it, so it keeps using the marker.
    else if (t.kind === "question" && mayAsk) content = `${ASK_MARKER} ${t.content}`;
    else if (t.kind === "chat") content = `${CHAT_MARKER} ${t.content}`;
    else content = t.content;
    parts.push({ role: t.role, content });
  }
  parts.push({ role: "user", content: final });

  const response = await client.create({
    maxTokens: MAX_TOKENS,
    effort: effortFrom(options.effort),
    system: mayAsk ? CHAT_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT_NO_ASK,
    messages: mergeSameRole(parts),
    budgetMs: Math.min(TOTAL_BUDGET_MS, REPLY_BUDGET_MS - (clock() - started)),
  });
  const text = response.text.trim();
  if (text.includes(CRISIS_SENTINEL)) return crisis();
  if (response.stopReason === "max_tokens" || response.stopReason === "refusal") return notFound();
  if (!text || text.includes(NOT_FOUND)) return notFound();

  if (text.includes(CHAT_MARKER)) {
    const smallTalk = text.slice(CHAT_MARKER.length).trim();
    if (
      !text.startsWith(CHAT_MARKER) ||
      !smallTalk ||
      smallTalk.includes(CHAT_MARKER) ||
      smallTalk.includes(ASK_MARKER) ||
      smallTalk.length > MAX_CHAT_CHARS ||
      citedRefs(smallTalk).length > 0 // anything about a verse must go through the checked answer path
    ) {
      return notFound();
    }
    return { kind: "chat", text: smallTalk, sources: [] };
  }

  if (text.includes(ASK_MARKER)) {
    const question = text.slice(ASK_MARKER.length).trim();
    if (!mayAsk || !text.startsWith(ASK_MARKER) || !question || question.includes(ASK_MARKER) || question.length > MAX_QUESTION_CHARS) {
      return notFound();
    }
    return { kind: "question", text: question, sources: [] };
  }

  const supplied = new Set(hits.map((hit) => hit.verse.ref));
  const cited = citedRefs(text);
  if (cited.length === 0 || cited.some((ref) => !supplied.has(ref))) return notFound();
  return { kind: "answer", text, sources: cited };
}
