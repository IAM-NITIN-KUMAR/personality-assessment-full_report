import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { BadConversation } from "@/lib/v2/gita/reply";
import { askGita, gitaAvailable, NotConfigured, OverDailyLimit } from "@/lib/v2/gita/service";

// The "Ask the Gita" section of the report talks to this route. The route finds the verses
// that bear on the student's message and has the model answer from those verses only
// (lib/v2/gita). The Gemini key never leaves the server; settings are listed in
// lib/v2/gita/service.ts. Without a key the section is simply not shown.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_CHARS = 64_000;
const MAX_TURNS = 40;
const MAX_TURN_CHARS = 4000;
const MAX_REPORT_BYTES = 20_000;

/** Is the chat set up? The report shows the section only when it is. */
export async function GET() {
  return NextResponse.json(gitaAvailable() ? { available: true } : { available: false, reason: "not_configured" });
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** A stable, non-reversible id per visitor, so questions can be capped per person without keeping an IP address. */
function studentId(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(`gita:${ip}`).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  if (!gitaAvailable()) return fail(503, "unavailable");

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return fail(413, "too_long");
  let body: { messages?: unknown; report?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "bad_request");
  }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_TURNS) {
    return fail(400, "bad_request");
  }

  // Keep only the fields the chat uses.
  const messages: { role: string; content: string; kind?: string }[] = [];
  for (const m of body.messages as Record<string, unknown>[]) {
    if (!m || typeof m.role !== "string" || typeof m.content !== "string") return fail(400, "bad_request");
    if (m.content.length > MAX_TURN_CHARS) return fail(413, "too_long");
    messages.push({ role: m.role, content: m.content, ...(typeof m.kind === "string" ? { kind: m.kind } : {}) });
  }
  const report = body.report && typeof body.report === "object" && !Array.isArray(body.report) ? body.report : null;
  if (report && Buffer.byteLength(JSON.stringify(report), "utf8") > MAX_REPORT_BYTES) return fail(413, "too_long");

  try {
    return NextResponse.json(await askGita(messages, report, studentId(req)));
  } catch (e) {
    if (e instanceof BadConversation) return fail(400, "bad_request");
    if (e instanceof OverDailyLimit) return fail(429, "limit");
    if (e instanceof NotConfigured) return fail(503, "unavailable");
    // Model or network failure: say which kind in the server log, never to the browser.
    console.error(`Ask the Gita failed: ${e instanceof Error ? e.constructor.name : "error"}`);
    return fail(502, "unavailable");
  }
}
