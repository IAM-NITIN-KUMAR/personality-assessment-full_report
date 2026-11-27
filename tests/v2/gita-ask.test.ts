// askGita: the daily cap, and the rule that a student in crisis is always answered.
// The network is replaced by a fetch that always fails, so no key or connection is needed.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CRISIS_MESSAGE } from "../../lib/v2/gita/prompts";

const ask = [{ role: "user", content: "I am scared of failing my exams" }];
const crisis = [{ role: "user", content: "I want to end my life" }];

async function freshService(env: Record<string, string>) {
  vi.resetModules();
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  return import("../../lib/v2/gita/service");
}

describe("askGita", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("refuses when no key is set", async () => {
    const { askGita, gitaAvailable, NotConfigured } = await freshService({ GEMINI_API_KEY: "", GOOGLE_API_KEY: "" });
    expect(gitaAvailable()).toBe(false);
    await expect(askGita(ask, null, "s1")).rejects.toBeInstanceOf(NotConfigured);
  });

  it("stops a student who has used up the day's questions, and only that student", async () => {
    const { askGita, OverDailyLimit } = await freshService({ GEMINI_API_KEY: "k", GITA_DAILY_PER_STUDENT: "1", GITA_REWRITE: "off" });
    // The first question is counted even though the (offline) model then fails.
    await expect(askGita(ask, null, "s1")).rejects.not.toBeInstanceOf(OverDailyLimit);
    await expect(askGita(ask, null, "s1")).rejects.toBeInstanceOf(OverDailyLimit);
    await expect(askGita(ask, null, "s2")).rejects.not.toBeInstanceOf(OverDailyLimit);
  });

  it("answers a crisis message with the help message even past the cap, without calling a model", async () => {
    const { askGita, OverDailyLimit } = await freshService({ GEMINI_API_KEY: "k", GITA_DAILY_PER_STUDENT: "1", GITA_REWRITE: "off" });
    await expect(askGita(ask, null, "s1")).rejects.toBeDefined();
    await expect(askGita(ask, null, "s1")).rejects.toBeInstanceOf(OverDailyLimit);
    const calls = vi.mocked(fetch).mock.calls.length;
    expect(await askGita(crisis, null, "s1")).toEqual({ kind: "crisis", text: CRISIS_MESSAGE, sources: [] });
    expect(vi.mocked(fetch).mock.calls.length).toBe(calls);
  });
});
