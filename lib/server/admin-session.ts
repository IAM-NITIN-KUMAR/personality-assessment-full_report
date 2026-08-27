// Stateless admin session: "<expiryMs>.<hmacHex>" signed with ADMIN_SESSION_SECRET.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ss_admin";
const SESSION_TTL_MS = 12 * 3600_000;

function hmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signSession(secret: string, now: number = Date.now()): string {
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${hmac(exp, secret)}`;
}

export function verifySession(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < now) return false;
  const expected = hmac(exp, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
