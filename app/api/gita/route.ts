import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { toGitaReply } from "@/lib/v2/gita/chat";

// The "Ask the Gita" section of the report talks to this route, and this route
// talks to the Gita chat service (a separate Python service that holds the
// verses and writes the answers). The browser never learns where that service
// lives, and the shared secret never leaves the server.
//
//   GITA_API_URL     base URL of the service. Unset in production means the
//                    section is simply not shown. In development it defaults
//                    to http://127.0.0.1:8000.
//   GITA_API_SECRET  optional; sent as x-gita-secret so the service can refuse
//                    callers that are not this app.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_CHARS = 64_000;
const MAX_TURNS = 40;
const MAX_TURN_CHARS = 4000;
const HEALTH_TIMEOUT_MS = 4000;
const CHAT_TIMEOUT_MS = 55_000;

function serviceUrl(): string | null {
  const url = process.env.GITA_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000");
  return url ? url.replace(/\/+$/, "") : null;
}

function serviceHeaders(req?: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.GITA_API_SECRET) headers["x-gita-secret"] = process.env.GITA_API_SECRET;
  if (req) {
    // A stable, non-reversible id per visitor so the service can cap questions per person
    // without ever seeing an IP address.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    headers["x-gita-client"] = createHash("sha256").update(`gita:${ip}`).digest("hex").slice(0, 24);
  }
  return headers;
}

/** Is the chat service reachable? The report shows the section only when it is. */
export async function GET() {
  const base = serviceUrl();
  if (!base) return NextResponse.json({ available: false, reason: "not_configured" });
  try {
    const res = await fetch(`${base}/healthz`, {
      headers: serviceHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    return NextResponse.json(res.ok ? { available: true } : { available: false, reason: "unhealthy" });
  } catch {
    return NextResponse.json({ available: false, reason: "unreachable" });
  }
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  const base = serviceUrl();
  if (!base) return fail(503, "unavailable");

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return fail(413, "too_long");
  let body: { messages?: unknown; report?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "bad_request");
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_TURNS) {
    return fail(400, "bad_request");
  }

  // Forward only the fields the service expects.
  const messages: { role: string; content: string; kind?: string }[] = [];
  for (const m of body.messages as Record<string, unknown>[]) {
    if (!m || typeof m.role !== "string" || typeof m.content !== "string") return fail(400, "bad_request");
    if (m.content.length > MAX_TURN_CHARS) return fail(413, "too_long");
    messages.push({ role: m.role, content: m.content, ...(typeof m.kind === "string" ? { kind: m.kind } : {}) });
  }
  const report = body.report && typeof body.report === "object" && !Array.isArray(body.report) ? body.report : null;

  let res: Response;
  try {
    res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: serviceHeaders(req),
      body: JSON.stringify({ messages, report }),
      cache: "no-store",
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
  } catch {
    return fail(502, "unavailable");
  }

  if (res.status === 429) return fail(429, "limit");
  if (res.status === 413 || res.status === 422) return fail(413, "too_long");
  if (res.status === 400) return fail(400, "bad_request");
  if (!res.ok) return fail(502, "unavailable");

  try {
    return NextResponse.json(toGitaReply(await res.json()));
  } catch {
    return fail(502, "unavailable");
  }
}
