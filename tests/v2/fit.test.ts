import { describe, it, expect } from "vitest";
import { computeFit, clampFit, NEUTRAL_CONF_COMPONENT } from "../../lib/v2/careers/fit";
import type { RadarScores } from "../../lib/v2/types";

const ananya: RadarScores = {
  analytical: 10, people: 4, creative: 6, entrepreneurial: 6, practical: 10, leadership: 4,
};

describe("fit formula", () => {
  it("reproduces the sample card 1: Risk 9, An+Pr, conf +2 → 84", () => {
    const { fit, capped } = computeFit({ roleScore: 9, radar: ananya, dims: ["analytical", "practical"], conf: 2 });
    expect(fit).toBe(84); // 30 + 30 + 24
    expect(capped).toBe(false);
  });

  it("caps at 55 when conf_total <= -2", () => {
    const { fit, capped } = computeFit({ roleScore: 12, radar: ananya, dims: ["analytical", "practical"], conf: -2 });
    expect(fit).toBe(55);
    expect(capped).toBe(true);
  });

  it("clamps into 5..95 and never renders 100", () => {
    expect(clampFit(101)).toBe(95);
    expect(clampFit(100)).toBe(95);
    expect(clampFit(0)).toBe(5);
    expect(clampFit(-10)).toBe(5);
    expect(clampFit(84.4)).toBe(84);
  });

  it("max possible uncapped fit is 95 after clamp (12/12*40 + 10*3 + 10*3 = 100 → 95)", () => {
    const max: RadarScores = { ...ananya, analytical: 10, practical: 10 };
    const { fit } = computeFit({ roleScore: 12, radar: max, dims: ["analytical", "practical"], conf: 4 });
    expect(fit).toBe(95);
  });

  it("exports the neutral conf component for the honest-low card", () => {
    expect(NEUTRAL_CONF_COMPONENT).toBe(15); // (-1 + 6) * 3
  });
});
