import { describe, it, expect } from "vitest";
import { CATALOG, CROSS_BRANCH, nextStepFor } from "../../lib/v2/careers/catalog";
import { C_BRANCHES } from "../../lib/v2/question-bank";
import { DOMAIN_ORDER } from "../../lib/v2/types";
import type { RoleId } from "../../lib/v2/types";

describe("career catalog", () => {
  it("has 20 roles × 3 careers, each with name/whatLine/nextStep", () => {
    expect(Object.keys(CATALOG)).toHaveLength(20);
    for (const [role, entry] of Object.entries(CATALOG)) {
      expect(entry.careers, role).toHaveLength(3);
      for (const c of entry.careers) {
        expect(c.name.length).toBeGreaterThan(2);
        expect(c.whatLine.length).toBeGreaterThan(10);
        // NOTE: threshold is >2 not >3 — community's verbatim spec nextStep "MSW" is exactly 3 chars.
        expect(c.nextStep.length).toBeGreaterThan(2);
      }
    }
  });

  it("every role's domain matches the branch that owns it", () => {
    for (const domain of DOMAIN_ORDER) {
      for (const role of C_BRANCHES[domain].roles) {
        expect(CATALOG[role].domain, role).toBe(domain);
      }
    }
  });

  it("sample-verified dim pairs", () => {
    expect(CATALOG.risk.dims).toEqual(["analytical", "practical"]);
    expect(CATALOG.markets.dims).toEqual(["analytical", "entrepreneurial"]);
  });

  it("cross-branch map covers all six dims and points at real roles", () => {
    expect(Object.keys(CROSS_BRANCH)).toHaveLength(6);
    expect(CROSS_BRANCH.analytical).toEqual({ domain: "technology", role: "data" });
    for (const { domain, role } of Object.values(CROSS_BRANCH)) {
      expect(CATALOG[role as RoleId].domain).toBe(domain);
    }
  });

  it("adapts next-step for non-native degrees (Build for commerce → conversion route)", () => {
    expect(nextStepFor("build", 0, "engineering")).toBe("Portfolio route — ship two real projects");
    expect(nextStepFor("build", 0, "commerce")).toBe("MSc CS conversion, then portfolio");
    expect(nextStepFor("data", 0, "commerce")).toContain("open to");
  });
});
