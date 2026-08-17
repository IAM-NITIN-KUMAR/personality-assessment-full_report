import { describe, it, expect } from "vitest";
import { showAbroad } from "../../lib/v2/gate";
import { screenOrder, getScreen, nextScreenId, chosenDomain, degreeOf } from "../../lib/v2/flow";
import type { V2Answers } from "../../lib/v2/types";

const ananya: V2Answers = {
  Q0: ["b"],
  A1: ["c"], A2: ["a"], A3: ["a"], A4: ["d"], A5: ["c"], A6: ["b"], A7: ["c"],
  B1: ["a"], B2: ["c"], B3: ["b"], B4: ["b"], B5: ["a"], B6: ["c"],
  C1: ["b"], // cards for her are [technology, finance, business, entrepreneurship] → b = finance
  C2: ["c"], C3: ["c"], C4: ["c"], C5: ["a"],
  D1: ["b"], D2: ["b"],
  E1: ["f"], E2: ["e"], E3: ["c"],
  F1: ["b"], F2: ["a"], F3: ["a"],
  F4: ["b"], F5a: ["b", "c"], F5b: ["b"], F5c: ["b"],
};

describe("abroad gate", () => {
  it("passes for F3 higher/undecided AND A7 global/conditional", () => {
    expect(showAbroad({ F3: ["a"], A7: ["c"] })).toBe(true);
    expect(showAbroad({ F3: ["c"], A7: ["a"] })).toBe(true);
    expect(showAbroad({ F3: ["b"], A7: ["a"] })).toBe(false); // work
    expect(showAbroad({ F3: ["a"], A7: ["b"] })).toBe(false); // national
    expect(showAbroad({ F3: ["a"], A7: ["d"] })).toBe(false); // rooted
  });
});

describe("flow engine", () => {
  it("orders 24 core screens and appends F4/F5 only when gated in", () => {
    const order = screenOrder(ananya);
    expect(order.slice(0, 3)).toEqual(["Q0", "A1", "A2"]);
    expect(order).toContain("F4");
    expect(order).toContain("F5c");
    expect(order[order.length - 1]).toBe("F5c");
  });

  it("A7 national/rooted: F4 and F5 never render", () => {
    const order = screenOrder({ ...ananya, A7: ["d"] });
    expect(order).not.toContain("F4");
    expect(order).not.toContain("F5a");
    expect(order[order.length - 1]).toBe("F3");
  });

  it("F4 = 'I'd rather study in India' skips F5", () => {
    const order = screenOrder({ ...ananya, F4: ["c"] });
    expect(order).toContain("F4");
    expect(order).not.toContain("F5a");
  });

  it("resolves Ananya's degree and chosen domain", () => {
    expect(degreeOf(ananya)).toBe("commerce");
    expect(chosenDomain(ananya)).toBe("finance");
  });

  it("materialises C1 with her four domain cards", () => {
    const c1 = getScreen("C1", ananya);
    const labels = c1.options.map((o) => o.label);
    expect(labels[0]).toMatch(/^Technology & Data — /);
    expect(labels[1]).toMatch(/^Finance & Capital — /);
    expect(labels[2]).toMatch(/^Business & Management — /);
    expect(labels[3]).toMatch(/^Entrepreneurship & Product — /);
  });

  it("materialises C2 from the chosen branch", () => {
    const c2 = getScreen("C2", ananya);
    expect(c2.prompt).toBe("Monday morning at a finance firm. Which of these would you rather be doing?");
    expect(c2.options[2].label).toBe("Doing the review that catches the mistake everyone missed");
  });

  it("injects the winning role's cost/grind statements into D1/D2", () => {
    const d1 = getScreen("D1", ananya);
    const d2 = getScreen("D2", ananya);
    expect(d1.prompt).toContain("being the person who slows things down, and unpopular for it");
    expect(d1.prompt).toContain("Could you live with that?");
    expect(d2.prompt).toContain("rules that change yearly");
    expect(d2.prompt).toContain("Would you actually do that?");
  });

  it("F4 quotes the A7=c answer back", () => {
    expect(getScreen("F4", ananya).prompt).toContain("exceptional opportunity");
  });

  it("walks to the first unanswered screen and completes", () => {
    expect(nextScreenId({})).toBe("Q0");
    expect(nextScreenId({ ...ananya, F5c: undefined })).toBe("F5c");
    expect(nextScreenId(ananya)).toBeNull();
  });
});
