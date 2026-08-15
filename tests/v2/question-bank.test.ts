import { describe, it, expect } from "vitest";
import {
  STATIC_SCREENS, C_BRANCHES, D_STATEMENTS, D_OPTIONS,
  B_SCENARIOS, B_REACTION_OPTIONS, DEGREE_BY_Q0, F4_PROMPT, C1_PROMPT,
} from "../../lib/v2/question-bank";
import { DOMAIN_ORDER } from "../../lib/v2/types";

describe("v2 question bank integrity", () => {
  it("has every static screen with 4+ options (E1/E2 have 6, F3 has 3)", () => {
    expect(STATIC_SCREENS.Q0.options).toHaveLength(5);
    for (const id of ["A1","A2","A3","A4","A5","A6","A7","B1","B2","B3","B4","B5","B6","E3","F1","F2","F5b","F5c"] as const) {
      expect(STATIC_SCREENS[id].options, id).toHaveLength(4);
    }
    expect(STATIC_SCREENS.E1.options).toHaveLength(6);
    expect(STATIC_SCREENS.E2.options).toHaveLength(6);
    expect(STATIC_SCREENS.F3.options).toHaveLength(3);
    expect(STATIC_SCREENS.F5a.options).toHaveLength(6);
    expect(STATIC_SCREENS.F5a.multi).toBe(true);
  });

  it("every C branch has 4 roles and 4 screens of 4 weighted options", () => {
    for (const domain of DOMAIN_ORDER) {
      const branch = C_BRANCHES[domain];
      expect(branch.roles).toHaveLength(4);
      expect(branch.screens).toHaveLength(4);
      for (const s of branch.screens) {
        expect(s.options).toHaveLength(4);
        for (const o of s.options) {
          const total = Object.values(o.weights).reduce((x, y) => x + (y ?? 0), 0);
          expect(total, `${domain} ${s.id} ${o.key}`).toBeGreaterThanOrEqual(3);
          for (const role of Object.keys(o.weights)) expect(branch.roles).toContain(role);
        }
      }
    }
  });

  it("spot-checks Finance weights used by the worked sample", () => {
    const fin = C_BRANCHES.finance;
    const c2 = fin.screens.find((s) => s.id === "C2")!;
    expect(c2.options.find((o) => o.key === "c")!.weights).toEqual({ risk: 3, markets: 1 });
    const c5 = fin.screens.find((s) => s.id === "C5")!;
    expect(c5.options.find((o) => o.key === "a")!.weights).toEqual({ markets: 3 });
  });

  it("has cost+grind statements for all 20 roles", () => {
    expect(Object.keys(D_STATEMENTS)).toHaveLength(20);
    for (const v of Object.values(D_STATEMENTS)) {
      expect(v.cost.length).toBeGreaterThan(10);
      expect(v.grind.length).toBeGreaterThan(10);
    }
  });

  it("B reaction scale is the fixed 4-option scale", () => {
    expect(B_REACTION_OPTIONS.map((o) => o.key)).toEqual(["a", "b", "c", "d"]);
    expect(Object.keys(B_SCENARIOS)).toHaveLength(6);
  });

  it("never says 'abroad' before F4", () => {
    const pre = [
      ...Object.entries(STATIC_SCREENS).filter(([id]) => !id.startsWith("F5")),
      ...Object.values(C_BRANCHES).flatMap((b) => b.screens.map((s) => ["C", s] as const)),
    ];
    const text = JSON.stringify([pre, D_STATEMENTS, D_OPTIONS, C1_PROMPT, B_SCENARIOS]);
    expect(text.toLowerCase()).not.toContain("abroad");
  });

  it("maps Q0 keys to degrees and F4 quotes A7 back", () => {
    expect(DEGREE_BY_Q0).toEqual({ a: "engineering", b: "commerce", c: "science", d: "arts", e: "other" });
    expect(F4_PROMPT("a")).toContain("anywhere in the world");
    expect(F4_PROMPT("c")).toContain("exceptional");
    expect(F4_PROMPT("a").toLowerCase()).toContain("abroad");
  });
});
