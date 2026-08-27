import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "../../lib/server/admin-session";

const SECRET = "test-secret";
const NOW = 1_700_000_000_000;

describe("admin session token", () => {
  it("round-trips: a signed token verifies", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, SECRET, NOW)).toBe(true);
  });

  it("expires after 12 hours", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, SECRET, NOW + 12 * 3600_000 - 1)).toBe(true);
    expect(verifySession(token, SECRET, NOW + 12 * 3600_000 + 1)).toBe(false);
  });

  it("rejects a tampered expiry", () => {
    const token = signSession(SECRET, NOW);
    const [, sig] = token.split(".");
    expect(verifySession(`${NOW + 999_999_999}.${sig}`, SECRET, NOW)).toBe(false);
  });

  it("rejects the wrong secret, garbage, and undefined", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, "other-secret", NOW)).toBe(false);
    expect(verifySession("not-a-token", SECRET, NOW)).toBe(false);
    expect(verifySession(undefined, SECRET, NOW)).toBe(false);
  });
});
