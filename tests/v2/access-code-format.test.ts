import { describe, it, expect } from "vitest";
import {
  CODE_ALPHABET, CODE_LENGTH, formatCode, generateCode, normalizeCode,
} from "../../lib/server/access-code-format";

describe("access code format", () => {
  it("alphabet has 32 unambiguous chars (no 0/O/1/I)", () => {
    expect(CODE_ALPHABET).toBe("ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
    expect(new Set(CODE_ALPHABET).size).toBe(32);
  });

  it("generateCode returns 8 chars, all from the alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode();
      expect(code).toHaveLength(CODE_LENGTH);
      for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    }
  });

  it("generateCode does not repeat across a large sample", () => {
    const seen = new Set(Array.from({ length: 1000 }, () => generateCode()));
    expect(seen.size).toBe(1000);
  });

  it("normalizeCode uppercases and strips dashes and spaces", () => {
    expect(normalizeCode(" abcd-2345 ")).toBe("ABCD2345");
    expect(normalizeCode("AB cd 23-45")).toBe("ABCD2345");
  });

  it("formatCode inserts the display dash", () => {
    expect(formatCode("ABCD2345")).toBe("ABCD-2345");
  });
});
