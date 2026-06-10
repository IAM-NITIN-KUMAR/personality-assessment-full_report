import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getClient, PROBE_MODEL } from "@/lib/anthropic";
import type { Question, Option } from "@/lib/types";

interface ProbeRequest {
  parent: Question;
  parentAnswer: { label: string; reaction?: string };
  recentTrail: Array<{ prompt: string; answer: string }>;
  discipline: string;
  section: any;
  /** "deeper" — generate a NEW follow-up scenario as a separate card.
   *  "rephrase" — rewrite the SAME question in place, preserving option ids and
   *    scoring intent. The `tone` field controls the rewrite voice:
   *      "positive" — the student loved it, give them more in this vein
   *      "negative" — the student found it boring, switch scenarios entirely
   */
  mode?: "deeper" | "rephrase";
  tone?: "positive" | "negative";
}

const SYSTEM_DEEPER = `You write follow-up scenario questions for a personality + career-fit assessment for 16–24 year-old students.

Your job: given an anchor question the student just answered, write ONE follow-up scenario that digs deeper into what they revealed — NOT a rephrase, NOT a recap. The follow-up should feel like a friend pulling on a thread.

Strict rules:
- 1 question, 4 options labeled A B C D.
- Conversational, specific, present tense. No corporate language. No Likert ("how strongly do you agree…"). No "rate yourself".
- Each option must be a concrete behavior, not a feeling.
- Options should be genuinely different choices a real student would make — not 4 flavors of the same answer.
- Keep the prompt under 240 characters.
- Keep each option under 120 characters.
- Tone: warm, slightly cheeky, never corporate.

Return ONLY a JSON object — no prose, no code fences:
{
  "category": "two- or three-word tag, ALL CAPS",
  "prompt": "the question",
  "options": [
    {"id":"a","label":"…"},
    {"id":"b","label":"…"},
    {"id":"c","label":"…"},
    {"id":"d","label":"…"}
  ]
}`;

const SYSTEM_REPHRASE_BASE = `You rewrite a single assessment scenario for a 16–24 year-old student. The goal is the same psychometric measurement, surfaced through a different scenario.

You will be given:
- The original prompt
- The original 4 options (A/B/C/D) — each option captures a *type* of behavior we measure

Your job: rewrite the prompt and rewrite each option's label, but PRESERVE THE MAPPING — option A in the rewrite must capture the same kind of behavior/disposition as option A in the original. Same for B, C, D.

Strict rules:
- 1 prompt, 4 options labeled A/B/C/D, ids unchanged.
- Same psychometric weight per option. Don't accidentally swap which option is "deliberate" vs "intuitive", etc.
- Conversational, specific, present tense. No Likert. No corporate language.
- Prompt < 240 chars. Each option < 120 chars.

Return ONLY a JSON object — no prose, no code fences:
{
  "category": "two- or three-word tag, ALL CAPS",
  "prompt": "the new question",
  "options": [
    {"id":"a","label":"…"},
    {"id":"b","label":"…"},
    {"id":"c","label":"…"},
    {"id":"d","label":"…"}
  ]
}`;

const SYSTEM_REPHRASE_POSITIVE =
  SYSTEM_REPHRASE_BASE +
  `\n\nTONE: The student LOVED the previous version. Stay close to that vibe — same kind of setting, same level of edge, but go SHARPER. More specific. More cutting. More texture. Not a totally different scenario; the *next pass* of the one they liked.`;

const SYSTEM_REPHRASE_NEGATIVE =
  SYSTEM_REPHRASE_BASE +
  `\n\nTONE: The student found the previous version BORING or generic. Switch to a completely different scenario — different setting, metaphor, or moment. Surprise them. Whatever the previous one assumed about their world, flip it.`;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ProbeRequest;
  const mode = body.mode ?? "deeper";
  const client = getClient();

  if (!client) {
    // Honest response — no LLM credentials, so we cannot produce a meaningful
    // probe or rewrite. Client treats this as "skip" rather than showing a
    // deterministic fallback that looks like a duplicate of the parent.
    return NextResponse.json(
      { skip: true, reason: "no_llm" },
      { status: 200 },
    );
  }

  const system =
    mode === "rephrase"
      ? body.tone === "positive"
        ? SYSTEM_REPHRASE_POSITIVE
        : SYSTEM_REPHRASE_NEGATIVE
      : SYSTEM_DEEPER;
  const userMsg = mode === "rephrase" ? buildRephraseUserMsg(body) : buildDeeperUserMsg(body);

  try {
    const resp = await client.messages.create({
      model: PROBE_MODEL,
      max_tokens: 700,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
    });

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as {
      category: string;
      prompt: string;
      options: Array<{ id: string; label: string }>;
    };

    if (mode === "rephrase") {
      // Map rewritten labels back onto the original options' scoring map.
      const merged: Option[] = (body.parent.options ?? []).map((orig) => {
        const rew = parsed.options.find((o) => o.id === orig.id);
        return { ...orig, label: rew?.label ?? orig.label };
      });
      const out: Question = {
        ...body.parent,
        prompt: parsed.prompt,
        category: parsed.category || body.parent.category,
        options: merged,
      };
      return NextResponse.json(out);
    }

    const probe: Question = {
      id: `adapt_${body.parent.id}_${Date.now()}`,
      section: body.section,
      kind: "adaptive",
      type: "single_choice",
      category: parsed.category,
      prompt: parsed.prompt,
      options: parsed.options.map((o) => ({ id: o.id, label: o.label })),
      parentId: body.parent.id,
      dimension: body.parent.dimension,
    };
    return NextResponse.json(probe);
  } catch (err) {
    console.error(`[probe:${mode}] generation failed, skipping:`, err);
    return NextResponse.json({ skip: true, reason: "llm_error" }, { status: 200 });
  }
}

function buildDeeperUserMsg(body: ProbeRequest): string {
  return [
    `Anchor question: "${body.parent.prompt}"`,
    `Anchor category: ${body.parent.category}`,
    `Student picked: "${body.parentAnswer.label}"`,
    body.parentAnswer.reaction ? `Reaction to it: ${body.parentAnswer.reaction}` : "",
    body.recentTrail.length
      ? `Recent trail (most recent last):\n${body.recentTrail.map((t, i) => `${i + 1}. ${t.prompt} → ${t.answer}`).join("\n")}`
      : "",
    `Student discipline: ${body.discipline}`,
    `Section: ${body.section}`,
    "",
    "Write the follow-up scenario now. JSON only.",
  ].filter(Boolean).join("\n");
}

function buildRephraseUserMsg(body: ProbeRequest): string {
  const opts = (body.parent.options ?? [])
    .map((o) => `  ${o.id.toUpperCase()}: "${o.label}"`)
    .join("\n");
  return [
    `Original prompt: "${body.parent.prompt}"`,
    `Original category: ${body.parent.category}`,
    `Original options:\n${opts}`,
    `Student discipline: ${body.discipline}`,
    `Tone signal from student: ${body.tone ?? "negative"}`,
    "",
    "Rewrite per the TONE rule above. Preserve the A/B/C/D option mapping.",
    "JSON only.",
  ].join("\n");
}

