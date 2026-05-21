# Roots & Routes — Secure Steps

A personality + career-fit assessment for students, built as a Next.js web app.

Live deployment: **https://roots-and-routes-rho.vercel.app**

---

## What this is

Roots & Routes is a ~45-question scenario-based assessment that produces a
~20-page personalized report. It's the in-funnel replacement for PRISM in
the Secure Steps flow.

The student picks an interest area (and optionally a specific course from a
catalogue of 50+ degrees), then walks through three sections — Context,
Roots (universal personality), Routes (discipline-specific scenarios + an
engagement check). The output is a detailed HTML report plus a downloadable
PDF covering:

- Six dimensional readings (rendered as a radar)
- 30+ derived stats (strengths, growth edges, work environment, etc.)
- Eight work aptitudes (rendered as a radar)
- 18 environment-fit predictions
- 26 career-development traits across 6 categories
- Top course recommendations from a 50+ course catalogue, ranked by archetype fit
- Adjacent / alternative course pathways
- A short letter for the student's family
- A thank-you closer

Optional layers when an Anthropic API key is set:
- Adaptive follow-up questions tailored to what the student just said
- Reaction-driven rewrites — react to a question and the LLM regenerates it
  in a different scenario (positive = sharper, negative = different angle)

---

## Stack

- **Next.js 15.5** (App Router) on Node 20+
- **React 19**
- **TypeScript (strict)**
- **Tailwind CSS 3** + a small set of custom utility classes
- **Zustand** (with `persist` middleware) — assessment state lives in
  `localStorage`, no backend DB yet
- **framer-motion** — card transitions, radar polygon animations
- **@react-pdf/renderer** — the PDF report (rendered client-side, no server
  function needed)
- **@anthropic-ai/sdk** — optional, only used by `/api/probe` for adaptive
  follow-ups and reaction-driven rewrites
- Deployed on **Vercel** (Next.js framework preset, framework explicitly
  set to `nextjs` via the project API)

---

## Get it running locally

Prereqs: **Node 20+** and **npm**.

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Drop in an Anthropic API key for live LLM probes
cp .env.local.example .env.local
# Open .env.local and paste your key after ANTHROPIC_API_KEY=
# Get one at https://console.anthropic.com/

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

Without a key, the assessment still works end-to-end on the fixed question
bank; adaptive follow-ups and reaction-driven rewrites are simply skipped
(the API route returns `{ skip: true, reason: "no_llm" }` and the client
moves on).

Production build:

```bash
npm run build
npm run start
```

---

## File map

```
app/                              Next.js App Router pages
├─ layout.tsx                    Root layout, fonts (Inter + JetBrains Mono)
├─ globals.css                   Tailwind layers + .panel, .mono-eyebrow, .btn-* classes
├─ page.tsx                      Landing page — hero + sign-up form with 13-discipline + course picker
├─ assessment/page.tsx           Main assessment orchestrator (state, navigation, reactions, probes)
├─ teaser/page.tsx               Halfway "You're [archetype]" reveal screen
├─ report/page.tsx               Report page wrapper — header, download PDF, end session
├─ thank-you/page.tsx            End-of-session screen — clears store, auto-redirects
└─ api/probe/route.ts            Server route: Claude probe (deeper / rephrase modes) or "skip"

components/
├─ ui/
│  ├─ button.tsx                 Outline / solid / ghost / electric variants
│  ├─ logo.tsx                   Secure Steps pinwheel mark (img + SVG fallback)
│  └─ photo-upload.tsx           Circular drop-zone with canvas-based compression
├─ node-graph/
│  ├─ assessment-graph.tsx       History rail + viewport-centered stage + transitions
│  ├─ question-card.tsx          The card itself — single/multi/short-text + auto-advance + reactions
│  ├─ trunk-chip.tsx             Collapsed previous-answer chip (clickable to edit)
│  └─ reaction-bar.tsx           5-emoji bar (Apple emoji images via jsdelivr CDN)
├─ report-view.tsx               The HTML report — cover, drivers, dimensions, stats, niches, recs, etc.
└─ report-visuals.tsx            <RadarChart> + <EngagementDial> SVG components

lib/                              Pure domain + utils
├─ types.ts                      Dimension, Question, Answer, StudentProfile, Reaction, Archetype
├─ utils.ts                      cn() className helper
├─ store.ts                      Zustand store with localStorage persist
├─ flow.ts                       planNext() — decides what comes after the current question
├─ image.ts                      compressToAvatar() — canvas-based JPEG compression
├─ anthropic.ts                  Anthropic SDK client wrapper
├─ archetype.ts                  computeDimensionScores() + pickArchetype()
├─ course-catalogue.ts           50+ courses across 13 disciplines with careers + dimension weights
├─ report-data.ts                Big derivation engine — stats, work prefs, aptitudes, env fit,
│                                career traits, drivers, future-day, parent letter, degree recs
├─ report-pdf.tsx                @react-pdf/renderer report — ~20 pages including radar + dial
└─ question-bank/
   ├─ context.ts                 10 context questions (budget, geo, family, dream, etc.)
   ├─ roots.ts                   20 Roots anchor scenarios
   └─ routes-bca.ts              8 Routes anchors + engagement check (BCA-specific)

public/
├─ Secure logo black svg.svg     Actual brand logo (referenced by <Logo>)
└─ logo.svg                      Initial placeholder (unused)

.claude/
├─ launch.json                   Preview-server config (Claude Code only)
└─ settings.local.json           Local Claude Code settings (Claude Code only)
```

---

## Architecture notes for Nitin

**State** lives in `lib/store.ts` (Zustand), persisted to `localStorage`
under the key `roots-and-routes-assessment`. The schema is the
`AssessmentState` interface in `lib/types.ts`. There's no backend DB —
when we move to multi-device / multi-counsellor we'll swap the persist
layer to Supabase (the swap is ~30 lines, all in `store.ts`).

**Question flow** is in `lib/flow.ts`. `planNext({ current, trunk, discipline })`
returns the next step — append an anchor, generate a probe, or transition
sections. It's pure; the assessment page calls it and applies the result.

**Archetype scoring** is in `lib/archetype.ts`. Six dimensions, each option
on each question contributes weighted scores; the highest-fitting archetype
of the six (Builder / Strategist / Connector / Maverick / Anchor / Explorer)
gets surfaced.

**The report** is two parallel renders of the same data shape (`ReportData`
in `lib/report-data.ts`):
- `components/report-view.tsx` — interactive HTML, Tailwind + framer-motion
- `lib/report-pdf.tsx` — printable PDF, `@react-pdf/renderer` primitives

Whenever you add a new section, add it to BOTH renderers so the download
matches the screen.

**The LLM layer** (`app/api/probe/route.ts`) is optional. If
`ANTHROPIC_API_KEY` is missing, the route returns `{ skip: true }` and the
client treats every probe / rewrite as a no-op. Setting the key flips the
LLM features on without any other code change.

---

## Editing the question bank

All questions live in `lib/question-bank/`:
- `context.ts` — front-loaded context (budget, family, etc.)
- `roots.ts` — universal personality anchors
- `routes-bca.ts` — BCA / CS-flavoured anchors + the engagement check

Each anchor has stable `id`, `type` (`single_choice` / `multi_choice` /
`short_text`), `dimension` it maps to, and per-option `scores: Partial<Record<Dimension, number>>`.

Adding routes for other disciplines (BBA, BCom, Law, etc.) is the next big
piece of work — currently those disciplines fall back to the BCA routes
bank.

---

## Editing the course catalogue

`lib/course-catalogue.ts` (~50 entries). Each course has:
- `id` (stable, url-safe)
- `title`
- `discipline` (one of 13)
- `description`
- `careers` array — short role + salary range
- Optional `weights` — Partial<Record<Dimension, number>> that nudges the
  match score for students with those dimensions

The landing page's course picker and the report's "Routes Worth Walking"
section both read from this catalogue.

---

## Brand & copy

Visual: pink **#FA7BD6** electric, near-black ink, white surfaces, mono
eyebrows (JetBrains Mono), display headings in Inter Bold. The look
deliberately avoids resembling competitor reports — see the rebrand pass
that renamed every section title and rewrote the parent letter / future-day
narrative in original Secure Steps voice.

Brand metaphor: **roots define you, routes are yours to choose** — used
across section titles ("Routes Worth Walking", "Branches Worth Knowing",
"Where the Routes Lead", "Others on Your Route").

---

## Deployment

Currently deployed on Vercel via:

```bash
npx vercel --prod
```

The Vercel project has `framework: "nextjs"` set via the API (the CLI's
default `vercel projects add` creates an empty project with `framework:
null`, which causes every route to return a 404; see commit history for
the fix).

To wire up live LLM probes on the deployed version: add `ANTHROPIC_API_KEY`
under Vercel → Project Settings → Environment Variables → Production +
Preview, then redeploy.
