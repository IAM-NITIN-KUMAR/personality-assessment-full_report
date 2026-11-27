// The daily caps and the environment helpers, ported from the Python service
// (tests/test_service_guards.py and the wiring in web.py), plus tests for the verse search,
// which is new here: a plain cosine search over an index held in memory.
import { afterEach, describe, it, expect, vi } from "vitest";
import type { Embedder } from "../../lib/v2/gita/gemini";
import { DEFAULT_DAILY_PER_STUDENT, DEFAULT_DAILY_TOTAL, DailyLimiter, envInt } from "../../lib/v2/gita/limiter";
import { geminiKey, gitaAvailable, rewriteOn } from "../../lib/v2/gita/service";
import { createVerseStore, type VerseIndex } from "../../lib/v2/gita/verse-store";

afterEach(() => {
  vi.unstubAllEnvs();
});

// --- daily caps ------------------------------------------------------------------------

describe("DailyLimiter", () => {
  it("caps each student and the day's total", () => {
    const limiter = new DailyLimiter(2, 3);
    expect([limiter.allow("a"), limiter.allow("a"), limiter.allow("a")]).toEqual([true, true, false]);
    expect(limiter.allow("b")).toBe(true); // third of the day
    expect(limiter.allow("c")).toBe(false); // day total used up
  });

  it("starts again on a new day", () => {
    let today = "2026-11-24";
    const limiter = new DailyLimiter(1, 0, () => today);
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("a")).toBe(false);
    today = "2026-11-25";
    expect(limiter.allow("a")).toBe(true);
  });

  it("the day's total starts again on a new day as well", () => {
    let today = "2026-11-24";
    const limiter = new DailyLimiter(0, 2, () => today);
    expect([limiter.allow("a"), limiter.allow("b"), limiter.allow("c")]).toEqual([true, true, false]);
    today = "2026-11-25";
    expect(limiter.allow("c")).toBe(true);
  });

  it("zero means no cap", () => {
    const limiter = new DailyLimiter(0, 0);
    for (let i = 0; i < 500; i++) expect(limiter.allow("a")).toBe(true);
  });

  it("a refused question is not counted", () => {
    const limiter = new DailyLimiter(1, 2);
    expect([limiter.allow("a"), limiter.allow("a"), limiter.allow("a")]).toEqual([true, false, false]);
    expect(limiter.allow("b")).toBe(true); // only one of the day's two was used by "a"
  });

  it("keeps the service's defaults", () => {
    expect(DEFAULT_DAILY_PER_STUDENT).toBe(40);
    expect(DEFAULT_DAILY_TOTAL).toBe(2000);
  });
});

// --- environment helpers ------------------------------------------------------------------

describe("envInt", () => {
  it.each([undefined, "", "   "])("uses the default when the variable is unset or blank: %j", (value) => {
    expect(envInt(value, 40)).toBe(40);
  });

  it.each([
    ["12", 12],
    [" 7 ", 7],
    ["0", 0],
    ["+5", 5],
    ["007", 7],
  ] as const)("reads a whole number: %j", (value, expected) => {
    expect(envInt(value, 40)).toBe(expected);
  });

  it.each(["-3", "-0", " -100 "])("is never negative: %j", (value) => {
    expect(envInt(value, 40)).toBe(0);
  });

  it.each(["abc", "12abc", "1.5", "ten", "1,000", "Infinity", "NaN"])("uses the default when the value is not a whole number: %j", (value) => {
    expect(envInt(value, 40)).toBe(40);
  });
});

describe("geminiKey", () => {
  it.each([
    [{ GEMINI_API_KEY: "g" }, "g"],
    [{ GOOGLE_API_KEY: "g" }, "g"],
    [{ GEMINI_API_KEY: "first", GOOGLE_API_KEY: "second" }, "first"],
    [{ GEMINI_API_KEY: "  ", GOOGLE_API_KEY: " g2 " }, "g2"],
    [{ GEMINI_API_KEY: "  padded  " }, "padded"],
    [{ ANTHROPIC_API_KEY: "a" }, ""],
    [{ GEMINI_API_KEY: "  " }, ""],
    [{}, ""],
  ] as [Record<string, string>, string][])("reads the key under either name: %j", (env, expected) => {
    expect(geminiKey(env)).toBe(expected);
  });

  it("reads the real environment by default, and the section is offered only with a key", () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    expect(geminiKey()).toBe("");
    expect(gitaAvailable()).toBe(false);
    vi.stubEnv("GOOGLE_API_KEY", "g");
    expect(geminiKey()).toBe("g");
    expect(gitaAvailable()).toBe(true);
  });
});

describe("rewriteOn", () => {
  it("the search-phrase step is on unless it is switched off", () => {
    expect(rewriteOn({})).toBe(true);
    for (const value of ["on", "1", "true", "yes", "", "anything"]) expect(rewriteOn({ GITA_REWRITE: value }), value).toBe(true);
  });

  it.each(["off", "0", "false", "no", " OFF ", "False", "No"])("GITA_REWRITE=%j switches it off", (value) => {
    expect(rewriteOn({ GITA_REWRITE: value })).toBe(false);
  });

  it("reads the real environment by default", () => {
    vi.stubEnv("GITA_REWRITE", "off");
    expect(rewriteOn()).toBe(false);
    vi.stubEnv("GITA_REWRITE", "on");
    expect(rewriteOn()).toBe(true);
  });
});

// --- the verse search (new here) -------------------------------------------------------------

/** Vectors as the index file holds them: signed bytes (component x 127), base64. */
function encode(vectors: number[][]): string {
  return Buffer.from(Int8Array.from(vectors.flat().map((x) => Math.round(x * 127))).buffer).toString("base64");
}

const VERSES = [
  { ref: "Gita 2.47", text: "duty" },
  { ref: "Gita 12.13", text: "mercy" },
  { ref: "Gita 2.66", text: "peace" },
  { ref: "Gita 3.8", text: "mostly duty, some mercy" },
];

function index(extra: Partial<VerseIndex> = {}): VerseIndex {
  return {
    model: "test",
    dims: 3,
    verses: VERSES,
    vectors: encode([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0.8, 0.6, 0],
    ]),
    ...extra,
  };
}

/** An embedder that gives every query the same vector, and records what it was asked. */
function embedAs(vector: number[]) {
  const asked: [string[], string][] = [];
  const embed: Embedder = async (texts, kind) => {
    asked.push([texts, kind]);
    return texts.map(() => vector);
  };
  return { embed, asked };
}

describe("createVerseStore", () => {
  it("returns the closest verses, nearest first, by cosine distance", async () => {
    const { embed, asked } = embedAs([1, 0, 0]);
    const hits = await createVerseStore(index(), embed).search("what is my duty?", 4);
    expect(hits.map((h) => h.verse.ref)).toEqual(["Gita 2.47", "Gita 3.8", "Gita 12.13", "Gita 2.66"]);
    expect(hits[0].verse).toEqual({ ref: "Gita 2.47", text: "duty" });
    expect(hits[0].distance).toBeCloseTo(0, 5); // the same direction
    expect(hits[1].distance).toBeCloseTo(0.2, 2);
    expect(hits[2].distance).toBeCloseTo(1, 5); // unrelated
    expect(hits[3].distance).toBeCloseTo(1, 5);
    expect(asked).toEqual([[["what is my duty?"], "query"]]);
  });

  it("the order follows the query", async () => {
    const hits = await createVerseStore(index(), embedAs([0, 1, 0]).embed).search("q", 2);
    expect(hits.map((h) => h.verse.ref)).toEqual(["Gita 12.13", "Gita 3.8"]);
    const opposite = await createVerseStore(index(), embedAs([-1, 0, 0]).embed).search("q", 4);
    expect(opposite[opposite.length - 1].verse.ref).toBe("Gita 2.47");
    expect(opposite[opposite.length - 1].distance).toBeCloseTo(2, 5);
  });

  it("returns no more than k verses, and all of them when k is larger than the index", async () => {
    const store = createVerseStore(index(), embedAs([1, 0, 0]).embed);
    expect(await store.search("q", 1)).toHaveLength(1);
    expect(await store.search("q", 3)).toHaveLength(3);
    expect(await store.search("q", 10)).toHaveLength(4);
    expect((await store.search("q", 1))[0].verse.ref).toBe("Gita 2.47");
  });

  it("k of zero or less returns nothing and embeds nothing", async () => {
    const { embed, asked } = embedAs([1, 0, 0]);
    const store = createVerseStore(index(), embed);
    expect(await store.search("q", 0)).toEqual([]);
    expect(await store.search("q", -1)).toEqual([]);
    expect(asked).toEqual([]);
  });

  it("an empty index returns nothing and embeds nothing", async () => {
    const { embed, asked } = embedAs([1, 0, 0]);
    const store = createVerseStore(index({ verses: [], vectors: "" }), embed);
    expect(store.count()).toBe(0);
    expect(await store.search("q", 5)).toEqual([]);
    expect(asked).toEqual([]);
  });

  it("counts its verses", () => {
    expect(createVerseStore(index(), embedAs([1, 0, 0]).embed).count()).toBe(4);
  });

  it("vectors that do not match the verses are an error", async () => {
    const short = index({
      vectors: encode([
        [1, 0, 0],
        [0, 1, 0],
      ]),
    });
    await expect(createVerseStore(short, embedAs([1, 0, 0]).embed).search("q", 2)).rejects.toThrow(/vectors do not match/);
    const wrongDims = index({ dims: 5 });
    await expect(createVerseStore(wrongDims, embedAs([1, 0, 0, 0, 0]).embed).search("q", 2)).rejects.toThrow(/vectors do not match/);
  });

  it("a query vector of the wrong size is an error", async () => {
    const store = createVerseStore(index(), embedAs([1, 0]).embed);
    await expect(store.search("q", 2)).rejects.toThrow(/wrong size/);
  });

  it("stored vectors need not be unit length", async () => {
    // the same directions at a quarter of the length: the distances do not change
    const quiet = index({
      vectors: encode([
        [0.25, 0, 0],
        [0, 0.25, 0],
        [0, 0, 0.25],
        [0.2, 0.15, 0],
      ]),
    });
    const hits = await createVerseStore(quiet, embedAs([1, 0, 0]).embed).search("q", 4);
    expect(hits.map((h) => h.verse.ref)).toEqual(["Gita 2.47", "Gita 3.8", "Gita 12.13", "Gita 2.66"]);
    expect(hits[0].distance).toBeCloseTo(0, 5);
    expect(hits[1].distance).toBeCloseTo(0.2, 1);
  });

  it("a failing embedder fails the search", async () => {
    const embed: Embedder = async () => {
      throw new Error("embedding service down");
    };
    await expect(createVerseStore(index(), embed).search("q", 2)).rejects.toThrow("embedding service down");
  });
});

describe("envInt: values that are not plain digits", () => {
  it.each(["1e3", "0x10", "12.0", "1_000"])("falls back to the default for %j", (value) => {
    expect(envInt(value, 40)).toBe(40);
  });
});
