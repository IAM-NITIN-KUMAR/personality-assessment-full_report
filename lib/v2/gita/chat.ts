// Shapes shared by the "Ask the Gita" section, its API route and the chat service,
// plus the small pure helpers that turn a reply's text into things to render.

// "chat" is a short conversational line (a greeting, a thank-you): no verse and no advice in it.
export type GitaReplyKind = "answer" | "question" | "chat" | "crisis" | "not_found";

export interface GitaReply {
  kind: GitaReplyKind;
  text: string;
  /** Verse references the answer cites, e.g. "Gita 2.47". Empty unless kind is "answer". */
  sources: string[];
}

/** One turn of the conversation, as sent to the service (oldest first). */
export interface GitaTurn {
  role: "user" | "assistant";
  content: string;
  kind?: GitaReplyKind;
}

const KINDS: readonly GitaReplyKind[] = ["answer", "question", "chat", "crisis", "not_found"];

/** Coerce whatever the service sent into a GitaReply; anything unexpected becomes "not_found". */
export function toGitaReply(value: unknown): GitaReply {
  const v = (value ?? {}) as Record<string, unknown>;
  const kind = KINDS.includes(v.kind as GitaReplyKind) ? (v.kind as GitaReplyKind) : "not_found";
  const text = typeof v.text === "string" ? v.text : "";
  const sources = Array.isArray(v.sources) ? v.sources.filter((s): s is string => typeof s === "string") : [];
  return { kind, text, sources };
}

export type AnswerBlock =
  | { type: "text"; text: string }
  | { type: "verse"; ref: string; text: string };

const REF_LINE = /^Gita\s+(\d+)[.:](\d+)$/i;

/**
 * An answer is prose, except that a paragraph headed by a bare reference
 * ("Gita 2.47" on its own line) is a verse quoted word for word.
 */
export function answerBlocks(text: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  for (const par of text.split(/\n\s*\n/)) {
    const lines = par.split("\n");
    const m = REF_LINE.exec(lines[0].trim());
    if (m && lines.length > 1) {
      blocks.push({ type: "verse", ref: `Gita ${m[1]}.${m[2]}`, text: lines.slice(1).join(" ").trim() });
    } else if (par.trim()) {
      blocks.push({ type: "text", text: par.trim() });
    }
  }
  return blocks;
}

/** Sources that are not already shown as a quoted verse, so a reference is never listed twice. */
export function unquotedSources(blocks: AnswerBlock[], sources: string[]): string[] {
  const quoted = new Set(blocks.flatMap((b) => (b.type === "verse" ? [b.ref] : [])));
  return sources.filter((s) => !quoted.has(s));
}

export type QuestionBlock = { type: "text"; text: string } | { type: "option"; text: string };

const OPTION_LINE = /^\s*\d+[.)]\s+(.+)$/;

/** A clarifying question may offer numbered choices ("1. ..."); each one becomes a button. */
export function questionBlocks(text: string): QuestionBlock[] {
  const blocks: QuestionBlock[] = [];
  for (const line of text.split("\n")) {
    const m = OPTION_LINE.exec(line);
    if (m) blocks.push({ type: "option", text: m[1].trim() });
    else if (line.trim()) blocks.push({ type: "text", text: line.trim() });
  }
  return blocks;
}

export type HelpPart = { type: "text"; text: string } | { type: "phone"; number: string };

/** Splits the crisis message so helpline numbers (3 to 5 digits) can be tap-to-call links. */
export function helpParts(text: string): HelpPart[] {
  const parts: HelpPart[] = [];
  const pattern = /\b\d{3,5}\b/g;
  let last = 0;
  let found: RegExpExecArray | null;
  while ((found = pattern.exec(text)) !== null) {
    if (found.index > last) parts.push({ type: "text", text: text.slice(last, found.index) });
    parts.push({ type: "phone", number: found[0] });
    last = found.index + found[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}
