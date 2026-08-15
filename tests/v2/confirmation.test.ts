import { describe, it, expect } from "vitest";
import { confTotal, confBand, D_SCORES } from "../../lib/v2/scoring/confirmation";

describe("confirmation", () => {
  it("scores a/b/c/d as +2/+1/0/-3", () => {
    expect(D_SCORES).toEqual({ a: 2, b: 1, c: 0, d: -3 });
  });

  it("Ananya: D1 b + D2 b → +2 provisional", () => {
    const t = confTotal({ D1: ["b"], D2: ["b"] });
    expect(t).toBe(2);
    expect(confBand(t)).toBe("provisional");
  });

  it("bands the full range", () => {
    expect(confBand(4)).toBe("confirmed");
    expect(confBand(3)).toBe("confirmed");
    expect(confBand(2)).toBe("provisional");
    expect(confBand(1)).toBe("provisional");
    expect(confBand(0)).toBe("mismatch");
    expect(confBand(-6)).toBe("mismatch");
  });

  it("range is -6..+4", () => {
    expect(confTotal({ D1: ["d"], D2: ["d"] })).toBe(-6);
    expect(confTotal({ D1: ["a"], D2: ["a"] })).toBe(4);
  });
});
