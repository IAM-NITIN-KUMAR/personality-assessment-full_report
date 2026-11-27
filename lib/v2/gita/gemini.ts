// Google Gemini as the model behind "Ask the Gita": one call that writes text, one that turns
// text into numbers for the verse search.
//
// Plain HTTPS. The API key travels in a header, never in the URL, and never appears in an
// error message or a log line. Conversations are sent with store: false, so they are not kept
// on Google's side.

const API = "https://generativelanguage.googleapis.com/v1beta";
const INTERACTIONS = `${API}/interactions`;

export const DEFAULT_MODEL = "gemini-4-hydrogen"; // general model with a free tier (checked 2026-11-24)
// Free-tier models are often "experiencing high demand". When the chosen model is busy or over its
// quota, these are tried in order, so a student still gets an answer. All have a free tier.
export const FALLBACK_MODELS: readonly string[] = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
// The verses in data/verses.json were turned into numbers with this model and size, so a
// question has to be as well. Changing either means rebuilding that file (scripts/build-gita-index.mjs).
export const EMBEDDING_MODEL = "gemini-embedding-2";
export const EMBEDDING_DIMS = 768;

// An overloaded model sometimes hangs instead of refusing, so no single try may run long, and
// one reply may not take longer overall than the page is willing to wait.
const ATTEMPT_TIMEOUT_MS = 18_000;
export const TOTAL_BUDGET_MS = 48_000;
const RETRY_WAITS_MS = [2_000, 6_000]; // waits before retrying the last model left to try
const COOL_OFF_MS = 600_000; // a model that was busy is skipped for this long, so later replies stay quick
const NETWORK_FAILURE = 599; // stands in for an HTTP status when no reply arrived at all
const EMBED_TIMEOUT_MS = 10_000;
const EMBED_RETRY_WAIT_MS = 1_500;

// Our effort setting, mapped to Gemini's thinking_level.
const THINKING_LEVEL: Record<string, string> = { low: "low", medium: "medium", high: "high", xhigh: "high", max: "high" };

/** The class name says what went wrong; only the name is ever logged. */
export class GeminiError extends Error {}
/** The key was rejected, or may not use this model. */
export class GeminiAuthError extends GeminiError {}
/** Too many requests for the key's quota (the free tier is small). */
export class GeminiRateLimitError extends GeminiError {}
/** Google rejected the request itself: unknown model, bad field. */
export class GeminiRequestError extends GeminiError {}
/** Google or the network failed. */
export class GeminiServerError extends GeminiError {}

export interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ModelRequest {
  /** The cap covers the model's own thinking as well as what it writes. */
  maxTokens: number;
  system: string;
  messages: ModelMessage[];
  effort?: string;
  /** Give up on this call after this long, across every model and retry. Defaults to TOTAL_BUDGET_MS. */
  budgetMs?: number;
}

export interface ModelResponse {
  text: string;
  stopReason: "end_turn" | "max_tokens" | "refusal";
  model: string;
}

/** What reply.ts needs from a model. Tests pass a fake. */
export interface ModelClient {
  create(request: ModelRequest): Promise<ModelResponse>;
}

export type EmbedKind = "query" | "document";
/** Turns each text into a unit-length vector. Tests pass a fake. */
export type Embedder = (texts: string[], kind: EmbedKind) => Promise<number[][]>;

export type Post = (
  url: string,
  headers: Record<string, string>,
  body: string,
  timeoutMs: number,
) => Promise<{ status: number; text: string }>;

const defaultPost: Post = async (url, headers, body, timeoutMs) => {
  try {
    // AbortSignal.timeout only takes whole milliseconds, and what is left of a budget rarely is one.
    const signal = AbortSignal.timeout(Math.max(1, Math.floor(timeoutMs)));
    const res = await fetch(url, { method: "POST", headers, body, cache: "no-store", signal });
    return { status: res.status, text: await res.text() };
  } catch (e) {
    // Reported like a server error so the caller can move on to another model.
    const name = e instanceof Error ? e.name : "Error";
    return { status: NETWORK_FAILURE, text: JSON.stringify({ error: { code: "network", message: name } }) };
  }
};

const escapeTags = (text: string) => text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The whole conversation as one text.
 *
 * Gemini's stateless mode expects its own earlier steps to be sent back exactly as it produced
 * them (they carry signatures). We keep only the text of earlier replies, so earlier turns are
 * quoted as a transcript and the latest message follows, unchanged.
 */
export function asSingleInput(messages: ModelMessage[]): string {
  const earlier = messages.slice(0, -1);
  const latest = messages[messages.length - 1];
  if (earlier.length === 0) return latest.content;
  const lines = ["Earlier in this conversation, oldest first:", ""];
  for (const m of earlier) {
    // reply.ts has already escaped and tagged what the student wrote
    if (m.role === "user") lines.push(`<earlier_turn from="student">${m.content}</earlier_turn>`);
    else lines.push(`<earlier_turn from="you">${escapeTags(m.content)}</earlier_turn>`);
  }
  lines.push("", "The student's latest message, with the material for answering it:", "", latest.content);
  return lines.join("\n");
}

/** [code, message] from an error body; Google has used both numeric and string codes. */
function errorOf(text: string): [string, string] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return ["", text.slice(0, 300)];
  }
  const error = (parsed as { error?: unknown } | null)?.error ?? {};
  if (typeof error !== "object" || error === null) return ["", String(error).slice(0, 300)];
  const e = error as Record<string, unknown>;
  const code = [e.code, e.status].map((x) => (x == null ? "" : String(x))).join(" ").trim();
  return [code, String(e.message ?? "").slice(0, 300)];
}

function errorFor(status: number): GeminiError {
  if (status === 401 || status === 403) return new GeminiAuthError(`HTTP ${status}`);
  if (status === 429) return new GeminiRateLimitError("HTTP 429");
  if (status >= 500) return new GeminiServerError(`HTTP ${status}`);
  return new GeminiRequestError(`HTTP ${status}`);
}

export interface GeminiOptions {
  /** Model that writes the answers; anything that is not a Gemini name is ignored. */
  model?: string;
  fallbacks?: readonly string[];
  post?: Post;
  sleep?: (ms: number) => Promise<void>;
  /** Milliseconds from any fixed point; only differences are used. */
  clock?: () => number;
}

export class GeminiClient implements ModelClient {
  readonly model: string;
  readonly fallbacks: readonly string[];
  private readonly apiKey: string;
  private readonly post: Post;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly clock: () => number;
  private readonly busyUntil = new Map<string, number>();

  constructor(apiKey: string, options: GeminiOptions = {}) {
    if (!apiKey) throw new Error("a Gemini API key is required");
    this.apiKey = apiKey;
    this.model = options.model && options.model.startsWith("gemini") ? options.model : DEFAULT_MODEL;
    this.fallbacks = options.fallbacks ?? FALLBACK_MODELS;
    this.post = options.post ?? defaultPost;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.clock = options.clock ?? (() => performance.now());
  }

  private headers(): Record<string, string> {
    return { "x-goog-api-key": this.apiKey, "Content-Type": "application/json" };
  }

  /** The models to try: the chosen one, then the fallbacks, leaving out any that were busy a
   * moment ago (unless that would leave nothing to try). */
  private order(): string[] {
    const chain = [...new Set([this.model, ...this.fallbacks])];
    const now = this.clock();
    const ready = chain.filter((m) => (this.busyUntil.get(m) ?? 0) <= now);
    return ready.length ? ready : chain;
  }

  async create({ maxTokens, system, messages, effort, budgetMs }: ModelRequest): Promise<ModelResponse> {
    const generation: Record<string, unknown> = { max_output_tokens: maxTokens };
    const level = THINKING_LEVEL[effort ?? ""];
    if (level) generation.thinking_level = level;
    const request = {
      system_instruction: system,
      input: asSingleInput(messages),
      generation_config: generation,
      store: false, // the student's conversation is not kept on Google's side
    };

    const deadline = this.clock() + (budgetMs ?? TOTAL_BUDGET_MS);
    const order = this.order();
    for (let position = 0; position < order.length; position++) {
      const name = order[position];
      const isLast = position === order.length - 1;
      const body = JSON.stringify({ model: name, ...request });
      let attempt = 0;
      for (;;) {
        const remaining = deadline - this.clock();
        if (remaining < 2_000) {
          console.error(`Gemini: out of time after trying ${order.slice(0, position + 1).join(", ")}`);
          throw new GeminiServerError("out of time");
        }
        const { status, text } = await this.post(INTERACTIONS, this.headers(), body, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
        if (status === 200) return GeminiClient.reply(text, name);
        const [code, message] = errorOf(text);
        if (status === 400 && code.toLowerCase().includes("safety")) {
          // Blocked by Google's safety filter: the caller treats this like a model refusal.
          return { text: "", stopReason: "refusal", model: name };
        }
        const busy = status === 429 || status >= 500;
        if (busy && isLast && attempt < RETRY_WAITS_MS.length) {
          await this.sleep(RETRY_WAITS_MS[attempt]);
          attempt += 1;
          continue;
        }
        if (busy) this.busyUntil.set(name, this.clock() + COOL_OFF_MS);
        if (busy && !isLast) {
          console.warn(`${name} is busy (HTTP ${status}); trying ${order[position + 1]}`);
          break; // on to the next model
        }
        console.error(`Gemini answered HTTP ${status} for ${name} (${code || "no code"}): ${message}`);
        throw errorFor(status);
      }
    }
    throw new GeminiServerError("no model available"); // unreachable: the last model always returns or throws
  }

  private static reply(text: string, name: string): ModelResponse {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new GeminiServerError("unreadable reply");
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) throw new GeminiServerError("unreadable reply");
    const status = data.status;
    if (status === "failed" || status === "cancelled") {
      console.error(`Gemini interaction ${status}`);
      throw new GeminiServerError(`interaction ${status}`);
    }
    let written = "";
    for (const step of Array.isArray(data?.steps) ? data.steps : []) {
      if (!step || typeof step !== "object" || step.type !== "model_output") continue;
      for (const part of Array.isArray(step.content) ? step.content : []) {
        if (part && typeof part === "object" && part.type === "text" && typeof part.text === "string") written += part.text;
      }
    }
    return { text: written, stopReason: status === "incomplete" ? "max_tokens" : "end_turn", model: name };
  }

  /** One unit-length vector per text, in the same order. A busy reply is retried once. */
  embed: Embedder = (texts, kind) => Promise.all(texts.map((text) => this.embedOne(text, kind)));

  private async embedOne(text: string, kind: EmbedKind): Promise<number[]> {
    const body = JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType: kind === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
      outputDimensionality: EMBEDDING_DIMS,
    });
    const url = `${API}/models/${EMBEDDING_MODEL}:embedContent`;
    for (let attempt = 0; ; attempt++) {
      const { status, text: replied } = await this.post(url, this.headers(), body, EMBED_TIMEOUT_MS);
      if (status === 200) return GeminiClient.vector(replied);
      if ((status === 429 || status >= 500) && attempt === 0) {
        await this.sleep(EMBED_RETRY_WAIT_MS);
        continue;
      }
      const [code, message] = errorOf(replied);
      console.error(`Gemini embedding answered HTTP ${status} (${code || "no code"}): ${message}`);
      throw errorFor(status);
    }
  }

  private static vector(text: string): number[] {
    let values: unknown;
    try {
      values = JSON.parse(text)?.embedding?.values;
    } catch {
      throw new GeminiServerError("unreadable embedding");
    }
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMS || !values.every((x) => typeof x === "number")) {
      throw new GeminiServerError("unexpected embedding");
    }
    const length = Math.hypot(...values) || 1;
    return values.map((x) => x / length);
  }
}
