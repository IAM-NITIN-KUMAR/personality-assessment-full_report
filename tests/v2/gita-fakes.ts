// Fakes shared by the "Ask the Gita" tests: a model client, a verse store and the HTTPS call.
// Nothing here touches the network or waits on a real timer.

import type { GitaReplyKind, GitaTurn } from "../../lib/v2/gita/chat";
import { GeminiClient, type ModelClient, type ModelRequest, type ModelResponse } from "../../lib/v2/gita/gemini";
import type { Hit, VerseStore } from "../../lib/v2/gita/verse-store";

type StopReason = ModelResponse["stopReason"];

export function hit(ref: string, text: string, distance: number): Hit {
  return { verse: { ref, text }, distance };
}

export const NEAR = hit("Gita 2.47", "You have a right to your actions, never to the fruits.", 0.3);
export const FAR = hit("Gita 9.99", "Unrelated far-away verse.", 1.4);

export function user(text: string): GitaTurn {
  return { role: "user", content: text };
}

export function bot(text: string, kind: GitaReplyKind = "answer"): GitaTurn {
  return { role: "assistant", content: text, kind };
}

/** Always gives the same reply (padded with white space, as a model might), and records each request. */
export class FakeClient implements ModelClient {
  calls: ModelRequest[] = [];

  constructor(
    public reply: string = "You can act without clinging. Gita 2.47",
    public stopReason: StopReason = "end_turn",
  ) {}

  async create(request: ModelRequest): Promise<ModelResponse> {
    this.calls.push(request);
    return { text: `  ${this.reply}\n`, stopReason: this.stopReason, model: "fake" };
  }
}

/** Replies in order (the last one repeats): first the search phrase, then the answer. */
export class SequenceClient implements ModelClient {
  calls: ModelRequest[] = [];
  private readonly replies: string[];
  private readonly stopReasons: StopReason[];
  private readonly failFirst: boolean;

  constructor(replies: string[], options: { failFirst?: boolean; stopReasons?: StopReason[] } = {}) {
    this.replies = [...replies];
    this.failFirst = options.failFirst ?? false;
    this.stopReasons = [...(options.stopReasons ?? [])];
  }

  async create(request: ModelRequest): Promise<ModelResponse> {
    this.calls.push(request);
    if (this.failFirst && this.calls.length === 1) throw new Error("provider down");
    const text = this.replies.length > 1 ? this.replies.shift()! : this.replies[0];
    return { text, stopReason: this.stopReasons.shift() ?? "end_turn", model: "fake" };
  }
}

/** Returns the same hits for every search, and records each search as [query, k]. */
export class FakeStore implements VerseStore {
  searchCalls: [string, number][] = [];

  constructor(public hits: Hit[]) {}

  async search(query: string, k: number): Promise<Hit[]> {
    this.searchCalls.push([query, k]);
    return this.hits;
  }

  count(): number {
    return this.hits.length;
  }
}

export class ExplodingStore implements VerseStore {
  async search(): Promise<Hit[]> {
    throw new Error("store must not be used");
  }

  count(): number {
    return 0;
  }
}

/** The final user message of the latest model call. */
export function finalContent(client: { calls: ModelRequest[] }): string {
  const { messages } = client.calls[client.calls.length - 1];
  return messages[messages.length - 1].content;
}

// --- Gemini over a fake wire ---------------------------------------------------------

export const KEY = "AQ.test-key-that-must-never-leak";
export const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

/** The body of a finished Gemini interaction. */
export function interaction(text = "Act without clinging. Gita 2.47", status = "completed", thought = true): string {
  const steps: unknown[] = [];
  if (thought) steps.push({ type: "thought", signature: "sig", summary: [{ type: "text", text: "private reasoning" }] });
  steps.push({ type: "model_output", content: [{ type: "text", text }] });
  return JSON.stringify({ id: "i1", status, steps, usage: { total_tokens: 10 } });
}

export type WireReply = [status: number, text: string];

export interface Sent {
  url: string;
  headers: Record<string, string>;
  /** The parsed JSON body; its shape differs between the two Gemini calls. */
  body: any; // eslint-disable-line
  timeout: number;
}

/** Stands in for the HTTPS call: returns the queued [status, body] pairs in order (the last one repeats). */
export class Wire {
  replies: WireReply[];
  sent: Sent[] = [];
  slept: number[] = [];
  now = 1_000_000; // milliseconds

  constructor(...replies: WireReply[]) {
    this.replies = replies.length ? replies : [[200, interaction()]];
  }

  post = async (url: string, headers: Record<string, string>, body: string, timeout: number) => {
    this.sent.push({ url, headers, body: JSON.parse(body), timeout });
    const [status, text] = this.replies.length > 1 ? this.replies.shift()! : this.replies[0];
    return { status, text };
  };

  sleep = async (ms: number) => {
    this.slept.push(ms);
  };

  clock = () => this.now;

  /** No fallbacks unless a test asks for them, so each test sees one model's behaviour. */
  client(model?: string, fallbacks: readonly string[] = []): GeminiClient {
    return new GeminiClient(KEY, { model, fallbacks, post: this.post, sleep: this.sleep, clock: this.clock });
  }

  models(): string[] {
    return this.sent.map((s) => s.body.model);
  }
}
