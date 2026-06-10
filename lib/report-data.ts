import {
  Answer,
  Archetype,
  Dimension,
  DIMENSION_LABELS,
  Question,
  StudentProfile,
} from "./types";
import {
  COURSES,
  DISCIPLINES,
  type Course,
  type Discipline,
  courseById,
  coursesByDiscipline,
} from "./course-catalog";

export interface ContextSummary {
  budget: string;
  budgetTag: string;
  geographies: string[];
  family: string;
  familyTag: string;
  tier: string;
  tierTag: string;
  timeline: string;
  timelineTag: string;
  dream: string;
}

export interface RoleCluster {
  name: string;
  why: string;
  fit: number; // 0..100
}

export interface EngagementReadout {
  score: number;
  level: "High" | "Real but quiet" | "Surface-level" | "Disconnected";
  message: string;
}

export interface Stat {
  /** Stable key — used for keys / anchors. */
  key: string;
  /** Section bucket. */
  section: "self" | "fit" | "honest" | "plan";
  /** Mono-uppercase label shown above value. */
  label: string;
  /** Headline value (a phrase, not a number). */
  value: string;
  /** 1–2 sentence explanation. */
  detail: string;
  /** Optional 0..100 score to render a meter. */
  score?: number;
  /** Optional tone tag for visual emphasis. */
  tone?: "positive" | "neutral" | "warning";
}

// ── PRISM-equivalent (and richer) deep-derivation types ────────────────────

export type PreferenceLevel = "Avoided" | "Weak" | "Moderate" | "Strong" | "Very Strong";

export interface WorkPreference {
  key: string;
  /** Short label e.g., "Cautious decisions". */
  label: string;
  /** One-line PRISM-style description of the preference. */
  detail: string;
  level: PreferenceLevel;
  /** Continuous 0..100 score, used for the visual bar. */
  score: number;
}

export interface WorkAptitude {
  key: string;
  /** Short label e.g., "Investigative & analytical". */
  label: string;
  /** Multi-sentence description (PRISM-style first-person). */
  detail: string;
  /** 0..100. */
  score: number;
}

export type EnvFit = "Enhanced" | "Neutral" | "Inhibited";

export interface EnvironmentFit {
  key: string;
  description: string;
  fit: EnvFit;
  score: number;
}

export interface CareerTrait {
  key: string;
  label: string;
  /** Pole description if score is low. */
  lowLabel: string;
  /** Pole description if score is high. */
  highLabel: string;
  /** 0..100 — center is balanced. */
  score: number;
}

export type CareerTraitCategory =
  | "People Skills"
  | "Drive for Results"
  | "Conscientiousness"
  | "Resilience"
  | "Thinking Skills"
  | "Ideal Environment";

export interface CareerTraitGroup {
  category: CareerTraitCategory;
  traits: CareerTrait[];
}

// ── Appli-inspired narrative & guidance types ─────────────────────────────

export interface Driver {
  key: string;
  /** Mono-uppercase category, e.g. "ACADEMIC DRIVER", "PASSION DRIVER". */
  category: string;
  label: string;
  description: string;
}

export interface ArchetypeQuote {
  text: string;
  attribution: string;
}

export interface DegreeRecommendation {
  title: string;
  /** 0..100 fit/match percent. */
  match: number;
  why: string;
  /** Short AI/industry-data callout shown as a tinted box. */
  insight: string;
}

export interface CareerPath {
  role: string;
  /** Distribution % among students of this archetype. */
  percentage: number;
}

export interface FutureDay {
  /** 4–6 sentences of vivid future-day prose. */
  narrative: string;
}

export interface ParentLetter {
  greeting: string;
  paragraphs: string[];
  signoff: string;
}

export interface ReportData {
  profile: StudentProfile;
  archetype: Archetype;
  context: ContextSummary;
  rootsReadout: Array<{ dimension: Dimension; value: number; sentence: string }>;
  routesClusters: RoleCluster[];
  engagement: EngagementReadout | null;
  stats: Stat[];
  niches: Array<{ name: string; tag: string; why: string; fit: number }>;
  /** PRISM-equivalent. Derived from dimension scores. */
  workPreferences: WorkPreference[];
  /** PRISM-style 8 work aptitudes, 0–100. */
  workAptitudes: WorkAptitude[];
  /** PRISM-style "this environment will Enhance / Inhibit you" predictions. */
  environmentFit: EnvironmentFit[];
  /** PRISM Career Development Analysis equivalent — 26 traits across 6 groups. */
  careerTraits: CareerTraitGroup[];
  /** Total measurement count, surfaced in the cover. */
  measurementCount: number;
  // ── Narrative & guidance (Appli-inspired) ─────────────────────────────
  /** Confidence in the archetype match, 0..100. Big number on the cover. */
  matchScore: number;
  /** 4–6 keyword tags that capture the student's themes (Innovation, Impact, etc.). */
  coreThemes: string[];
  /** One famous quote tied to the archetype's vibe. */
  archetypeQuote: ArchetypeQuote;
  /** 5 named drivers: Academic, Passion, Cognitive, Preferred Domain, Core Motivation. */
  drivers: Driver[];
  /** Generated narrative — "Five years from now, your day begins with …". */
  futureDay: FutureDay;
  /** 3 top-fit degree recommendations. */
  topDegrees: DegreeRecommendation[];
  /** 3 alternative pathways. */
  alternativeDegrees: DegreeRecommendation[];
  /** Career-path distribution among students of this archetype. */
  commonCareerPaths: CareerPath[];
  /** Shared interests / domains this archetype gravitates toward. */
  sharedInterests: string[];
  /** Formal letter to the student's parents. */
  parentLetter: ParentLetter;
}

export function buildReport(args: {
  profile: StudentProfile;
  archetype: Archetype;
  questions: Question[];
  answers: Record<string, Answer>;
}): ReportData {
  const { profile, archetype, questions, answers } = args;

  const dimMap = archetype.scores.reduce(
    (a, s) => ({ ...a, [s.dimension]: s.normalized }),
    {} as Record<Dimension, number>,
  );

  const context = extractContext(questions, answers);
  const engagement = extractEngagement(questions, answers);
  const routesClusters = routeClusters(profile.discipline, dimMap, engagement);
  const niches = extractNiches(profile.discipline, dimMap, engagement);

  const stats = buildStats({
    profile,
    archetype,
    dimMap,
    context,
    engagement,
    routesClusters,
  });

  const workPreferences = buildWorkPreferences(dimMap);
  const workAptitudes = buildWorkAptitudes(dimMap, engagement);
  const environmentFit = buildEnvironmentFit(dimMap);
  const careerTraits = buildCareerTraits(dimMap);

  const matchScore = buildMatchScore(archetype, engagement);
  const coreThemes = buildCoreThemes(archetype, context, dimMap);
  const archetypeQuote = quoteForArchetype(archetype.name);
  const drivers = buildDrivers({ archetype, dimMap, context, profile });
  const futureDay = buildFutureDay({ profile, archetype, context, coreThemes });
  const topDegrees = buildTopDegrees({ profile, dimMap, archetype, engagement });
  const alternativeDegrees = buildAlternativeDegrees({ profile, dimMap, archetype });
  const commonCareerPaths = buildCommonCareerPaths(archetype, profile);
  const sharedInterests = buildSharedInterests(archetype, context);
  const parentLetter = buildParentLetter({ profile, archetype, topDegrees, context });

  // Total distinct measurements surfaced to the student.
  // 6 dim + stats + niches + clusters + 15 prefs + 8 aptitudes + 18 env-fit
  // + 26 career traits + 1 engagement.
  const measurementCount =
    archetype.scores.length +
    stats.length +
    niches.length +
    routesClusters.length +
    workPreferences.length +
    workAptitudes.length +
    environmentFit.length +
    careerTraits.reduce((acc, g) => acc + g.traits.length, 0) +
    (engagement ? 1 : 0);

  return {
    profile,
    archetype,
    context,
    rootsReadout: archetype.scores.map((s) => ({
      dimension: s.dimension,
      value: s.normalized,
      sentence: dimensionSentence(s.dimension, s.normalized),
    })),
    routesClusters,
    engagement,
    stats,
    niches,
    workPreferences,
    workAptitudes,
    environmentFit,
    careerTraits,
    measurementCount,
    matchScore,
    coreThemes,
    archetypeQuote,
    drivers,
    futureDay,
    topDegrees,
    alternativeDegrees,
    commonCareerPaths,
    sharedInterests,
    parentLetter,
  };
}

// ── Match score, themes, quote ─────────────────────────────────────────────

function buildMatchScore(arch: Archetype, eng: EngagementReadout | null): number {
  // Take the spread between the top archetype-defining dimensions and the
  // rest. Higher spread = clearer signal = higher confidence.
  const sorted = [...arch.scores].sort((a, b) => Math.abs(b.normalized) - Math.abs(a.normalized));
  const top = Math.abs(sorted[0]?.normalized ?? 0);
  const median = Math.abs(sorted[Math.floor(sorted.length / 2)]?.normalized ?? 0);
  const spread = Math.max(0, top - median);
  const base = 78 + Math.min(18, spread * 0.25); // 78..96
  const engBoost = eng ? (eng.score - 1.5) * 1.5 : 0; // +/- 2.25
  return Math.max(70, Math.min(99, Math.round(base + engBoost)));
}

function buildCoreThemes(
  arch: Archetype,
  context: ContextSummary,
  s: Record<Dimension, number>,
): string[] {
  const themes = new Set<string>();
  // Archetype-driven base themes
  const name = arch.name;
  if (name.includes("Builder"))     ["Building","Ownership","Iteration"].forEach((t) => themes.add(t));
  if (name.includes("Strategist"))  ["Systems","Foresight","Precision"].forEach((t) => themes.add(t));
  if (name.includes("Connector"))   ["People","Influence","Translation"].forEach((t) => themes.add(t));
  if (name.includes("Maverick"))    ["Independence","Risk","Originality"].forEach((t) => themes.add(t));
  if (name.includes("Anchor"))      ["Stability","Standards","Quietness"].forEach((t) => themes.add(t));
  if (name.includes("Explorer"))    ["Curiosity","Breadth","Discovery"].forEach((t) => themes.add(t));

  // Dimension-driven themes
  if (s.drive > 40) themes.add("Drive");
  if (s.risk > 40) themes.add("Risk-on");
  if (s.structure > 40) themes.add("Discipline");
  if (s.social > 40) themes.add("Collaboration");
  if (s.energy > 40) themes.add("Energy");
  if (s.decision_style > 40) themes.add("Deliberation");

  // Value-driven themes from context
  // Note: ContextSummary doesn't preserve raw value tags. Skip if not extractable.

  return [...themes].slice(0, 6);
}

const ARCHETYPE_QUOTES: Record<string, ArchetypeQuote> = {
  "The Builder":     { text: "The best way to predict the future is to invent it.", attribution: "Alan Kay" },
  "The Strategist":  { text: "However beautiful the strategy, you should occasionally look at the results.", attribution: "Winston Churchill" },
  "The Connector":   { text: "The currency of real networking is not greed but generosity.", attribution: "Keith Ferrazzi" },
  "The Maverick":    { text: "Here's to the crazy ones. The misfits. The rebels. The ones who see things differently.", attribution: "Rob Siltanen" },
  "The Anchor":      { text: "Be regular and orderly in your life, so that you may be violent and original in your work.", attribution: "Gustave Flaubert" },
  "The Explorer":    { text: "Not all those who wander are lost.", attribution: "J.R.R. Tolkien" },
};

function quoteForArchetype(name: string): ArchetypeQuote {
  return (
    ARCHETYPE_QUOTES[name] ?? {
      text: "The unexamined life is not worth living.",
      attribution: "Socrates",
    }
  );
}

// ── Drivers (5) ────────────────────────────────────────────────────────────

function buildDrivers(args: {
  archetype: Archetype;
  dimMap: Record<Dimension, number>;
  context: ContextSummary;
  profile: StudentProfile;
}): Driver[] {
  const { archetype, dimMap: s, context, profile } = args;
  const sortedDims = [...archetype.scores].sort(
    (a, b) => Math.abs(b.normalized) - Math.abs(a.normalized),
  );
  const topDim = sortedDims[0]?.dimension;
  const topMeta = topDim ? DIMENSION_LABELS[topDim] : null;
  const topPole = topMeta ? (sortedDims[0].normalized >= 0 ? topMeta.high : topMeta.low) : "balanced";

  const cognitiveStyle =
    s.decision_style > 30 && s.structure > 30
      ? "deliberate, plan-first thinking"
      : s.decision_style > 30
      ? "deliberate but flexible"
      : s.drive > 30 && s.risk > 30
      ? "trial-and-error, learn-by-doing"
      : s.structure > 30
      ? "structured, step-by-step"
      : "intuitive and exploratory";

  const preferredDomain =
    s.social > 30 && s.energy > 20
      ? "collaborative, people-rich settings"
      : s.social > 30
      ? "small, trusted teams"
      : s.drive > 30 && s.risk > 30
      ? "fast-paced, ambiguous environments"
      : s.structure > 30
      ? "rigorous, quality-focused environments"
      : "creative, low-structure spaces";

  const coreMotivation =
    profile.discipline === "tech_cs" || profile.discipline === "tech_engg"
      ? s.drive > 40 && s.risk > 30
        ? "building things people actually use"
        : s.decision_style > 30
        ? "solving complex, layered problems"
        : "learning fast and shipping faster"
      : profile.discipline === "business" || profile.discipline === "commerce"
      ? s.drive > 30 && s.risk > 20
        ? "building or running ventures, not just analysing them"
        : "making decisions with money, people, and uncertainty"
      : profile.discipline === "psychology" || profile.discipline === "humanities"
      ? "understanding people and ideas, not just data"
      : "doing work that matters to you, in your field";

  const passionDriver =
    context.dream && context.dream.trim().length > 4
      ? `Your own words — "${truncate(context.dream, 80)}" — point to a deep pull toward `
      : "Your answers point to a pull toward ";

  return [
    {
      key: "core_strength",
      category: "CORE STRENGTH",
      label: topPole,
      description: `Your strongest reading is on ${topMeta?.label.toLowerCase() ?? "the balanced middle"}. This is the muscle that does the most work for you in study and in work — protect it.`,
    },
    {
      key: "pull",
      category: "WHAT PULLS YOU",
      label: archetype.name.replace(/^The\s/, ""),
      description: `${passionDriver}work where you can ${archetype.tagline.toLowerCase().replace(/\.$/, "")}.`,
    },
    {
      key: "how_you_think",
      category: "HOW YOU THINK",
      label: properCase(cognitiveStyle),
      description: `You arrive at decisions through ${cognitiveStyle}. Environments that respect that rhythm get the best version of you.`,
    },
    {
      key: "habitat",
      category: "NATIVE HABITAT",
      label: properCase(preferredDomain),
      description: `You do your best work in ${preferredDomain}. Anywhere else costs you energy you'd rather spend on the actual problem.`,
    },
    {
      key: "why_you_show_up",
      category: "WHY YOU SHOW UP",
      label: properCase(coreMotivation),
      description: `Without prompting, what you reach for is ${coreMotivation}. Pick environments that protect this — trade them only when it's worth it.`,
    },
  ];
}

function properCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n).trimEnd()}…` : s;
}

// ── Future Day narrative ──────────────────────────────────────────────────

function buildFutureDay(args: {
  profile: StudentProfile;
  archetype: Archetype;
  context: ContextSummary;
  coreThemes: string[];
}): FutureDay {
  const { profile, archetype, context, coreThemes } = args;
  const name = archetype.name.replace(/^The\s/, "").toLowerCase();
  const theme = coreThemes[0]?.toLowerCase() ?? "work that compounds";

  // Three short paragraphs. Different opening per archetype, different middle
  // per discipline, closing that names a specific theme + (optionally) the
  // student's own dream verbatim. Distinct voice from generic "vision board"
  // narratives — leans into the Roots / Routes metaphor and the brand's
  // preference for honest, low-drama prose.
  const opener =
    name === "builder" || name === "maverick"
      ? "It's five years from now. You're up earlier than you'd planned — there's an idea you wanted to sketch before the day made other claims on it."
      : name === "strategist" || name === "anchor"
      ? "It's five years from now. The morning has a rhythm you trust: same coffee, same notebook, the same first hour of decisions made quietly before anyone needs you."
      : name === "connector" || name === "explorer"
      ? "It's five years from now. The first three messages of the day are waiting — collaborators in different time zones, a thread you started yesterday that grew while you were asleep."
      : "It's five years from now. The morning is yours before the day gets loud. Whatever that hour looks like, it's the part that's been earning the rest.";

  const mid =
    profile.discipline === "tech_cs" || profile.discipline === "tech_engg"
      ? `By eleven you're inside the work — a PR review, a stuck function, a model that finally fits. The people around you are good. The craft is the point.`
      : profile.discipline === "business" || profile.discipline === "commerce" || profile.discipline === "economics"
      ? `By eleven the room is full — a small group making a real decision. Money moves. Someone's plan shifts. The people around you are the kind who think before they speak.`
      : profile.discipline === "psychology"
      ? `By eleven you're listening — to a client, a colleague, a case file. The work is quiet from the outside; what's underneath it is anything but. The people around you take it seriously.`
      : profile.discipline === "law"
      ? `By eleven you're translating mess into something a system can act on — a clause, a brief, a question that needed to be asked the right way. The people around you respect craft.`
      : profile.discipline === "media" || profile.discipline === "design_arch"
      ? `By eleven you're making something. The first draft is rough; the second is closer. The people around you are the kind who push the work and protect it.`
      : profile.discipline === "hospitality"
      ? `By eleven the team has moved into rhythm — service points covered, the day's tensions visible early. You see them before anyone else does. That's why the place runs.`
      : profile.discipline === "education"
      ? `By eleven you're in front of a room or one-on-one with a student. Something clicks for someone who'd been stuck. The people around you remember being on the other side of that.`
      : `By eleven you're in the work that matters most — the kind that bends a small piece of the world if you do it right.`;

  const dreamThread =
    context.dream && context.dream.trim().length > 6
      ? ` The thing you wrote down today — "${truncate(context.dream, 90)}" — turns out you weren't kidding. It's been quietly compounding the whole time.`
      : "";

  const closing = `By evening you stop. The day was spent on ${theme}, and you've earned a clean ending to it.${dreamThread}`;

  return { narrative: [opener, mid, closing.trim()].join(" ") };
}

// ── Degree Recommendations ────────────────────────────────────────────────

// Compute a single course's match% from the student's dimension scores +
// the course's optional weighting hints. Engagement softens technical tracks.
function scoreCourse(
  course: Course,
  s: Record<Dimension, number>,
  engagement: EngagementReadout | null,
): number {
  const e = engagement ? Math.min(1.18, 0.78 + engagement.score * 0.12) : 1.0;
  const isTech = course.discipline === "tech_cs" || course.discipline === "tech_engg";

  // Base alignment score from dimension weighting hints baked into the course.
  let raw = 70; // baseline
  if (course.weights) {
    for (const [dim, w] of Object.entries(course.weights)) {
      if (typeof w !== "number") continue;
      raw += (s[dim as Dimension] ?? 0) * w;
    }
  }
  // Small generic nudges so courses without explicit weights still differ.
  raw += s.drive * 0.05;
  raw += s.decision_style * 0.04;

  return Math.max(55, Math.min(99, Math.round(raw * (isTech ? e : 1.0))));
}

function courseToRecommendation(course: Course, match: number): DegreeRecommendation {
  const topCareer = course.careers[0];
  const careerSummary = course.careers
    .slice(0, 3)
    .map((c) => c.role)
    .join(" · ");
  return {
    title: course.title,
    match,
    why: course.description,
    insight: topCareer
      ? `Top opening role: ${topCareer.role} (${topCareer.salaryIndia}). Other common paths: ${careerSummary}.`
      : `Pathways from this degree span ${course.discipline.replace(/_/g, " ")}.`,
  };
}

function buildTopDegrees(args: {
  profile: StudentProfile;
  dimMap: Record<Dimension, number>;
  archetype: Archetype;
  engagement: EngagementReadout | null;
}): DegreeRecommendation[] {
  const { profile, dimMap: s, engagement } = args;
  const inDiscipline = coursesByDiscipline(profile.discipline);
  if (!inDiscipline.length) {
    return [
      {
        title: "Coming soon",
        match: 0,
        why: "Courses for this interest area are being added to the catalog. In the meantime, the dimensional profile + career traits give you a strong shortlist conversation with your counsellor.",
        insight: "Ask your Secure Steps counsellor to surface degree options manually until the catalog covers this area.",
      },
    ];
  }
  const ranked = inDiscipline
    .map((c) => ({ course: c, match: scoreCourse(c, s, engagement) }))
    .sort((a, b) => b.match - a.match);

  // If the student already picked a specific course, surface it first
  // (regardless of match), then top alternatives within the same area.
  const explicit = courseById(profile.course);
  const picks: typeof ranked = [];
  if (explicit && explicit.discipline === profile.discipline) {
    const explicitScore = scoreCourse(explicit, s, engagement);
    picks.push({ course: explicit, match: explicitScore });
  }
  for (const r of ranked) {
    if (picks.length >= 3) break;
    if (r.course.id === explicit?.id) continue;
    picks.push(r);
  }

  return picks.map(({ course, match }) => courseToRecommendation(course, match));
}

// Adjacent disciplines used to source alternative pathway recommendations.
const ADJACENT: Record<Discipline, Discipline[]> = {
  tech_cs:     ["tech_engg", "design_arch", "economics"],
  tech_engg:   ["tech_cs", "design_arch", "science"],
  business:    ["commerce", "economics", "tech_cs"],
  commerce:    ["business", "economics", "law"],
  science:     ["tech_cs", "economics", "psychology"],
  economics:   ["business", "commerce", "tech_cs"],
  psychology:  ["humanities", "media", "education"],
  humanities:  ["media", "law", "education"],
  media:       ["humanities", "psychology", "design_arch"],
  law:         ["business", "humanities", "commerce"],
  design_arch: ["tech_cs", "media", "humanities"],
  education:   ["humanities", "psychology", "media"],
  hospitality: ["business", "media", "design_arch"],
};

function buildAlternativeDegrees(args: {
  profile: StudentProfile;
  dimMap: Record<Dimension, number>;
  archetype: Archetype;
}): DegreeRecommendation[] {
  const { profile, dimMap: s } = args;
  const adjacent = ADJACENT[profile.discipline] ?? [];
  if (!adjacent.length) return [];

  // Best one course from each adjacent discipline.
  const picks = adjacent
    .map((d) => {
      const candidates = coursesByDiscipline(d);
      if (!candidates.length) return null;
      const ranked = candidates
        .map((c) => ({ course: c, match: scoreCourse(c, s, null) }))
        .sort((a, b) => b.match - a.match);
      return ranked[0];
    })
    .filter((x): x is { course: Course; match: number } => x !== null);

  return picks.slice(0, 3).map(({ course, match }) =>
    courseToRecommendation(course, Math.max(55, Math.min(88, match - 8))),
  );
}

// ── Community Insights ─────────────────────────────────────────────────────

function buildCommonCareerPaths(arch: Archetype, profile: StudentProfile): CareerPath[] {
  // Distribution among same-archetype peers — illustrative, not measured.
  if (profile.discipline !== "tech_cs") return [];
  if (arch.name.includes("Builder"))
    return [
      { role: "Product Engineer at scale-up",  percentage: 34 },
      { role: "Founding Engineer / early-stage", percentage: 27 },
      { role: "Indie / solo product builder",  percentage: 22 },
      { role: "Engineering Manager (5–10 yrs)", percentage: 17 },
    ];
  if (arch.name.includes("Strategist"))
    return [
      { role: "Systems / Backend Architect",   percentage: 32 },
      { role: "Tech consultancy / advisory",   percentage: 25 },
      { role: "Engineering team lead",         percentage: 23 },
      { role: "Research / hard-problem track", percentage: 20 },
    ];
  if (arch.name.includes("Connector"))
    return [
      { role: "Developer Advocate / DevRel",  percentage: 30 },
      { role: "Solutions / Forward-deployed", percentage: 28 },
      { role: "Product Manager",              percentage: 24 },
      { role: "Founder, B2B SaaS",            percentage: 18 },
    ];
  if (arch.name.includes("Maverick"))
    return [
      { role: "Solo / indie product founder", percentage: 35 },
      { role: "Founding Engineer at deeptech", percentage: 28 },
      { role: "Research engineer in frontier domain", percentage: 22 },
      { role: "Creative-technical hybrid",    percentage: 15 },
    ];
  if (arch.name.includes("Anchor"))
    return [
      { role: "Platform / Infra Engineer",    percentage: 33 },
      { role: "Site Reliability Engineer",    percentage: 28 },
      { role: "Security / hard-systems",       percentage: 22 },
      { role: "Engineering team lead",         percentage: 17 },
    ];
  return [
    { role: "Generalist Software Engineer",   percentage: 32 },
    { role: "Product Engineer",                percentage: 26 },
    { role: "Designer-engineer hybrid",        percentage: 22 },
    { role: "Founder track",                   percentage: 20 },
  ];
}

function buildSharedInterests(arch: Archetype, _context: ContextSummary): string[] {
  if (arch.name.includes("Builder"))    return ["Indie hacking", "Open-source", "Hardware experiments", "Side-projects"];
  if (arch.name.includes("Strategist")) return ["Long-form essays", "Game theory", "Chess / strategy games", "Systems thinking"];
  if (arch.name.includes("Connector"))  return ["Community building", "Conference talks", "Mentoring", "Cross-disciplinary collabs"];
  if (arch.name.includes("Maverick"))   return ["Deeptech research", "Frontier writing", "Speculative fiction", "Lone-wolf builds"];
  if (arch.name.includes("Anchor"))     return ["Distributed systems", "Reliability culture", "Postmortem reading", "Long-walks"];
  if (arch.name.includes("Explorer"))   return ["Hackathons across domains", "Travel-while-working", "Documentary watching", "Polymath communities"];
  return ["Personal projects", "Online learning", "Writing on the web", "Maker communities"];
}

// ── Parent letter ──────────────────────────────────────────────────────────

function buildParentLetter(args: {
  profile: StudentProfile;
  archetype: Archetype;
  topDegrees: DegreeRecommendation[];
  context: ContextSummary;
}): ParentLetter {
  const { profile, archetype, topDegrees, context } = args;
  const firstName = profile.name.split(" ")[0];
  const top = topDegrees[0];
  const top2 = topDegrees[1];

  // Geographies mapping
  const regions = context.geographies.map(g => {
    if (g.includes("northamerica")) return "US / Canada";
    if (g.includes("europe")) return "UK / Europe";
    if (g.includes("oceania")) return "Australia / New Zealand";
    if (g.includes("asia")) return "Asia";
    return g.replace("region:", "");
  }).filter(Boolean);
  const regionText = regions.length > 0 ? `target regions like ${regions.join(" or ")}` : "your target study destinations";

  // Budget mapping
  let budgetText = "your funding plan";
  if (context.budgetTag.includes("ready")) {
    budgetText = "within your fully-sorted funding plans";
  } else if (context.budgetTag.includes("partial")) {
    budgetText = "aligning with your mostly-planned budget range";
  } else if (context.budgetTag.includes("exploring")) {
    budgetText = "assisting as you start exploring funding options";
  } else if (context.budgetTag.includes("unsure")) {
    budgetText = "navigating early-stage budget and financial planning";
  } else if (context.budget && context.budget !== "—") {
    budgetText = `working with your budget details (${context.budget})`;
  }

  // Family dynamic mapping
  let familyParagraph = "";
  if (context.familyTag.includes("free")) {
    familyParagraph = `Since ${firstName} has the family's full support and backing, they have a strong, supportive foundation to take these next steps.`;
  } else if (context.familyTag.includes("opinions")) {
    familyParagraph = `Since ${firstName} values peer feedback and discussion, we want to help channel that social energy into validating their decisions with objective data.`;
  } else if (context.familyTag.includes("specific")) {
    familyParagraph = `As ${firstName} navigates this transition with guidance from mentors or teachers, we will work to align their personal goals with structured academic pathways.`;
  } else if (context.familyTag.includes("locked")) {
    familyParagraph = `Since ${firstName} is currently figuring this out solo, they will benefit greatly from your family's active support and guidance as we begin to narrow down their options.`;
  } else {
    familyParagraph = `A Secure Steps counsellor will sit with the three of you — student, family, us — to translate this report into a real shortlist of colleges.`;
  }

  // Timeline comment
  let timelineComment = "";
  if (context.timelineTag === "tl:now") {
    timelineComment = ` Because they are looking to make their move ASAP this year, we will focus on high-priority applications and shortlists.`;
  } else if (context.timelineTag === "tl:1y") {
    timelineComment = ` Since they have a 1-year timeline, we have the space to be surgical in our selection.`;
  } else if (context.timelineTag === "tl:2y") {
    timelineComment = ` With a comfortable 2-year runway, we'll focus on building their profile and projects first.`;
  } else if (context.timelineTag === "tl:open") {
    timelineComment = ` Since this is currently a longer-term plan, we will focus on exploration and initial alignment.`;
  }

  // Connect to alumni text
  const alumniText = `If it would help, we'll also connect ${firstName} with an alumnus or alumna already a year or two into one of these paths, so the picture isn't just data.`;

  return {
    greeting: `To ${firstName}'s family,`,
    paragraphs: [
      `Before anything else — ${firstName} sat through 25 honest reflective questions to produce this. They didn't rate themselves on a 1-to-5 scale. They picked what they'd actually do. The reading you're holding is built on those answers.`,
      `Across the responses, one pattern came through clearly: ${firstName} reads as ${archetype.name}. ${archetype.tagline} In day-to-day terms, that means ${archetype.description.toLowerCase()}${context.dream && context.dream.trim().length > 6 ? ` This aligns well with their stated goal: "${context.dream.trim()}".` : ""}`,
      top
        ? `The course that maps best onto this pattern is ${top.title} (${top.match}% alignment)${top2 ? `, with ${top2.title} (${top2.match}%) as a strong second look` : ""}. These options have been mapped to their preferences for ${regionText}, keeping in mind ${budgetText}. We didn't pick these from a brochure — they're the highest-scoring matches across our catalogue when run against the way ${firstName} actually responded.`
        : `Several courses align well; we'll walk you through them in the conversation that follows.`,
      `${familyParagraph}${timelineComment} ${alumniText}`,
      `Two things to keep in mind. First: ${firstName} isn't undecided. The pattern is real. Second: the highest-scoring degree on paper is rarely the right one for every family — fit is multi-axis, and that's what the next conversation is for.`,
    ],
    signoff: "With care,\nThe Secure Steps team",
  };
}

// ── Helpers shared by the new sections ─────────────────────────────────────

const norm = (raw: number) => clamp01_100(50 + raw / 2);
function clamp01_100(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

function levelOf(score: number): PreferenceLevel {
  if (score < 20) return "Avoided";
  if (score < 40) return "Weak";
  if (score < 60) return "Moderate";
  if (score < 80) return "Strong";
  return "Very Strong";
}

function fitOf(rawScore: number): EnvFit {
  if (rawScore > 25) return "Enhanced";
  if (rawScore < -25) return "Inhibited";
  return "Neutral";
}

// ── Work Preferences (15) — PRISM "Work Preference Profile" equivalent ────

function buildWorkPreferences(s: Record<Dimension, number>): WorkPreference[] {
  const items: Array<Omit<WorkPreference, "level" | "score"> & { raw: number }> = [
    {
      key: "cautious_decisions",
      label: "Cautious, astute decisions",
      detail: "Being cautious without being fearful. Making well-thought-out, evidence-led calls.",
      raw: s.decision_style + s.structure / 2 - s.risk / 2,
    },
    {
      key: "calm_under_pressure",
      label: "Calm under pressure",
      detail: "Staying rational, stable and unflustered when stress and demands ramp up.",
      raw: s.drive + s.structure / 2 - Math.abs(s.energy) / 2,
    },
    {
      key: "independent_targets",
      label: "Independent target work",
      detail: "Working alone toward tough objectives or tight deadlines without hand-holding.",
      raw: s.drive + (-s.social) / 2 + s.risk / 3,
    },
    {
      key: "sustained_focus",
      label: "Sustained focus on detail",
      detail: "Concentrating for long stretches on dense, detail-heavy material without losing thread.",
      raw: s.structure + s.decision_style / 2 - Math.abs(s.energy) / 3,
    },
    {
      key: "consensus_building",
      label: "Building consensus",
      detail: "Drawing out a group's talents, consulting widely, getting buy-in before action.",
      raw: s.social + (-s.decision_style) / 3,
    },
    {
      key: "creative_concepting",
      label: "Imagination & innovation",
      detail: "Generating original concepts, visualising outcomes, working laterally.",
      raw: s.risk + (-s.structure) / 2 + s.drive / 3,
    },
    {
      key: "adaptability",
      label: "Adapting to change",
      detail: "Tolerating criticism and shifting demands; staying consistent across varied conditions.",
      raw: s.risk + (-s.structure) / 3 + s.drive / 4,
    },
    {
      key: "strangers_sociability",
      label: "Sociability with strangers",
      detail: "Being cheerful, talkative and outgoing with new people, with high social bandwidth.",
      raw: s.energy + s.social / 2,
    },
    {
      key: "tough_decisions",
      label: "Tough, unpopular decisions",
      detail: "Implementing hard calls despite pushback. Confronting issues forthrightly.",
      raw: s.decision_style + s.risk / 2 - s.social / 3,
    },
    {
      key: "accommodating",
      label: "Sympathetic & accommodating",
      detail: "Deferring to others, being tolerant, relating through warmth and acceptance.",
      raw: s.social - s.decision_style / 3 - s.drive / 4,
    },
    {
      key: "long_term_motivation",
      label: "Long-term motivation",
      detail: "High commitment to long-horizon goals, pursuing them through obstacles and setbacks.",
      raw: s.drive + s.structure / 3,
    },
    {
      key: "persuasion",
      label: "Persuasion & influence",
      detail: "Effectively shifting others' viewpoints; selling an interpretation or course of action.",
      raw: s.energy + s.social / 2 + s.drive / 3,
    },
    {
      key: "fast_pace",
      label: "Fast-paced execution",
      detail: "Comfortable with urgency, multiple things in flight, quick context switches.",
      raw: s.drive + s.energy / 2 + s.risk / 3 - s.structure / 4,
    },
    {
      key: "rule_compliance",
      label: "Rule & process compliance",
      detail: "Following structures, procedures and standards even when inconvenient.",
      raw: s.structure - s.risk / 2,
    },
    {
      key: "self_sufficiency",
      label: "Self-sufficiency",
      detail: "Taking ownership of your own workload and productivity without leaning on others.",
      raw: s.drive - s.social / 2 + s.decision_style / 3,
    },
  ];

  return items.map((it) => {
    const score = norm(it.raw);
    return { ...it, score, level: levelOf(score) };
  });
}

// ── Work Aptitudes (8) — PRISM-style 0..100 ────────────────────────────────

function buildWorkAptitudes(
  s: Record<Dimension, number>,
  engagement: EngagementReadout | null,
): WorkAptitude[] {
  // Engagement softens technical-track aptitudes slightly when low.
  const eMul = engagement ? Math.min(1.15, 0.75 + engagement.score * 0.13) : 1.0;

  return [
    {
      key: "practical_mechanical",
      label: "Practical & mechanical",
      detail:
        "I enjoy hands-on activities and prefer environments that produce tangible, physical results. I have an aptitude for tools, machines and built-thing work, and follow established methods.",
      score: clamp01_100((50 + s.structure / 2 - s.energy / 3 - s.social / 4) * eMul),
    },
    {
      key: "investigative_analytical",
      label: "Investigative & analytical",
      detail:
        "I enjoy investigating things and solving complex problems. I'd rather analyse data and formulate ideas than lead, sell, or persuade. I avoid highly social, structured-from-outside situations.",
      score: clamp01_100((50 + s.decision_style * 0.45 + s.structure * 0.35 - s.energy * 0.15) * eMul),
    },
    {
      key: "creative_artistic",
      label: "Creative & artistic",
      detail:
        "I enjoy creative work in music, writing, design or performance, and prefer environments free of strict procedures. I work alone well and need room for personal expression. Sensitive to criticism, but driven by it.",
      score: clamp01_100(50 + s.risk * 0.4 - s.structure * 0.3 + s.drive * 0.2),
    },
    {
      key: "social_empathetic",
      label: "Social & empathetic",
      detail:
        "I enjoy people. I dislike impersonal tasks revolving around just data or material things. I'm motivated by work that helps mediate, teach, or solve interpersonal problems.",
      score: clamp01_100(50 + s.social * 0.5 + s.energy * 0.3),
    },
    {
      key: "competitive_entrepreneurial",
      label: "Competitive & entrepreneurial",
      detail:
        "I enjoy leading, persuading and motivating others. I value status, autonomy and outsized outcomes. I take a spontaneous approach and prefer launching things over operating routines.",
      score: clamp01_100(50 + s.drive * 0.4 + s.risk * 0.4 + s.energy * 0.2 - s.structure * 0.1),
    },
    {
      key: "orderly_efficient",
      label: "Orderly & efficient",
      detail:
        "I am methodical, logical and orderly. I prefer structure to ambiguity. I'm at home with paper-based or process-based work — accounting, record-keeping, operations — and dislike routines being upset.",
      score: clamp01_100(50 + s.structure * 0.5 + s.decision_style * 0.4 - s.risk * 0.15),
    },
    {
      key: "mathematical_logical",
      label: "Mathematical & logical",
      detail:
        "I enjoy reasoning with numbers and concentrating on quantitative problems for long stretches. I'm comfortable with mathematical tools and use logic to weigh alternatives.",
      score: clamp01_100((50 + s.decision_style * 0.45 + s.structure * 0.35 - s.energy * 0.2) * eMul),
    },
    {
      key: "outgoing_expressive",
      label: "Outgoing & expressive",
      detail:
        "I interact comfortably with a wide range of people and express my own feelings and opinions easily. I have high energy in groups, build rapport fast with strangers, and dislike working alone for long.",
      score: clamp01_100(50 + s.energy * 0.5 + s.social * 0.3 + s.drive * 0.2),
    },
  ];
}

// ── Environment Fit (18) — PRISM "Work Environment" equivalent ────────────

function buildEnvironmentFit(s: Record<Dimension, number>): EnvironmentFit[] {
  type Item = { key: string; description: string; raw: number };
  const items: Item[] = [
    { key: "independence", description: "Opportunity to act independently — controlling courses of action, policies, and resources without close supervision.", raw: s.drive + s.decision_style / 2 - s.social / 3 },
    { key: "win_win_negotiation", description: "Need to influence and negotiate win-win outcomes rather than exercise formal authority.", raw: s.social + s.energy / 2 - s.decision_style / 3 },
    { key: "steady_pace", description: "Steady pace where getting things right matters more than meeting tight deadlines.", raw: s.structure - s.drive / 3 - s.risk / 3 },
    { key: "public_recognition", description: "Significant public recognition and visibility for personal achievement.", raw: s.energy + s.drive / 2 - s.social / 3 },
    { key: "creativity_innovation", description: "Creativity, imagination and abstract thinking are encouraged with little need to follow a pre-built format.", raw: s.risk - s.structure / 2 + s.drive / 3 },
    { key: "business_opportunity", description: "Drive and ability to identify business opportunities are valued; emphasis on ambition and commercial outcomes.", raw: s.drive + s.risk / 2 - s.social / 4 },
    { key: "factual_research", description: "Strong focus on thoroughly researching and recording factual data with very little tolerance for error.", raw: s.structure + s.decision_style / 2 - s.risk / 3 },
    { key: "artistic_creative_work", description: "Considerable opportunity to engage in creative work — visual, written, conceptual.", raw: s.risk + s.drive / 4 - s.structure / 3 },
    { key: "self_sufficient_workload", description: "People are encouraged to be self-sufficient and own their workload and productivity.", raw: s.drive + s.decision_style / 3 - s.social / 3 },
    { key: "high_pressure_determination", description: "People are rewarded for performance and determination despite difficult conditions, opposition or setbacks.", raw: s.drive + s.risk / 2 + s.structure / 3 },
    { key: "networking", description: "Effective networking is key to success; many opportunities for new contacts and relationship-building.", raw: s.energy + s.social / 2 },
    { key: "public_speaking", description: "Frequent opportunities to speak publicly — presentations, motivating, persuading.", raw: s.energy + s.social / 3 + s.drive / 4 },
    { key: "dynamic_atmosphere", description: "Dynamic, fast-paced atmosphere where people take initiative and make things happen.", raw: s.drive + s.risk / 2 + s.energy / 2 },
    { key: "low_structure", description: "Little requirement to work in a highly structured way, or to comply with strict rules and procedures.", raw: s.risk - s.structure },
    { key: "strategic_thinking", description: "Strategic thinking is highly valued; clear vision for the future is seen as important.", raw: s.decision_style + s.drive / 2 + s.structure / 4 },
    { key: "predictable_routine", description: "Work routine and duties are largely predictable and stable over long periods.", raw: s.structure - s.risk - s.drive / 3 },
    { key: "helping_others", description: "Direct opportunity to help other people — individually or in small groups — and develop close relationships.", raw: s.social + s.energy / 4 },
    { key: "competitive_winlose", description: "Need to be challenging, forceful, ambitious and tough-minded — clear win-and-lose outcomes.", raw: s.drive + s.risk / 2 - s.social / 3 },
  ];
  return items.map((it) => ({ 
    key: it.key, 
    description: it.description, 
    fit: fitOf(it.raw),
    score: clamp01_100(50 + it.raw * 1.25)
  }));
}

// ── Career Development Traits (26 across 6 groups) ─────────────────────────

function buildCareerTraits(s: Record<Dimension, number>): CareerTraitGroup[] {
  type T = Omit<CareerTrait, "score"> & { raw: number };
  const groups: { category: CareerTraitCategory; traits: T[] }[] = [
    {
      category: "People Skills",
      traits: [
        { key: "teamworking", label: "Teamworking", lowLabel: "Formal and reserved, prefers to work alone without interruptions.", highLabel: "Prefers work that involves social interaction; likes supporting others and getting them involved.", raw: s.social + s.energy / 3 },
        { key: "concern_for_others", label: "Concern for others", lowLabel: "Less aware of others' feelings; reluctant to engage with emotional issues.", highLabel: "Caring and understanding; shows empathy; sympathetic and approachable.", raw: s.social + s.energy / 4 - s.decision_style / 4 },
        { key: "social_skills", label: "Social skills", lowLabel: "Quiet and guarded; prefers small groups; avoids the limelight.", highLabel: "Talkative, optimistic, expressive and lively; enjoys meeting new people.", raw: s.energy + s.social / 2 },
      ],
    },
    {
      category: "Drive for Results",
      traits: [
        { key: "initiative", label: "Initiative", lowLabel: "Prefers things stable; takes new work after consultation or when told.", highLabel: "Self-motivated; seizes opportunities; identifies and takes on challenges.", raw: s.drive + s.risk / 2 },
        { key: "ambition", label: "Ambition", lowLabel: "Easy-going, non-competitive; focuses on achievable, undemanding targets.", highLabel: "Enjoys tough goals; high aspirations; competitive and driven to succeed.", raw: s.drive + s.risk / 3 - s.social / 4 },
        { key: "risk_taking", label: "Risk taking", lowLabel: "Slower-paced; checks facts; complies with rules; avoids errors.", highLabel: "Fast-paced; impatient for results; willing to break rules to succeed.", raw: s.risk + s.drive / 4 - s.structure / 3 },
      ],
    },
    {
      category: "Conscientiousness",
      traits: [
        { key: "attention_to_detail", label: "Attention to detail", lowLabel: "Big-picture; not preoccupied with detail; easily distracted on follow-through.", highLabel: "Thorough, methodical; enjoys detailed work; follows commitments through.", raw: s.structure + s.decision_style / 3 },
        { key: "dependability", label: "Dependability", lowLabel: "Easily distracted from deadlines; casual about commitments.", highLabel: "Dependable, reliable, consistent; meets obligations with minimal supervision.", raw: s.structure + s.drive / 2 },
      ],
    },
    {
      category: "Resilience",
      traits: [
        { key: "stress_management", label: "Stress management", lowLabel: "Dislikes high-pressure work; tense and irritable; struggles with setbacks.", highLabel: "Works well under pressure; copes with multiple demands without emotional spillover.", raw: s.drive + s.structure / 3 - Math.abs(s.energy) / 3 },
        { key: "self_management", label: "Self management", lowLabel: "Openly expresses frustration; impatient; tends to vent.", highLabel: "Calm, easygoing and free of anxiety; rarely shows anger; calming influence.", raw: s.decision_style + s.structure / 3 - s.energy / 4 },
      ],
    },
    {
      category: "Thinking Skills",
      traits: [
        { key: "abstract_thinking", label: "Abstract thinking", lowLabel: "Builds on tested methods; avoids unconventional or abstract ideas.", highLabel: "Creative, imaginative and original; thinks laterally; dislikes rules.", raw: s.risk - s.structure / 2 + s.drive / 3 },
        { key: "analytical_thinking", label: "Analytical thinking", lowLabel: "Impulsive; quick decisions; relies on instinct rather than logic.", highLabel: "Analytical, cautious and astute; takes a logical approach using all available data.", raw: s.decision_style + s.structure / 2 },
      ],
    },
    {
      category: "Ideal Environment",
      traits: [
        { key: "need_social_interaction", label: "Need for social interaction", lowLabel: "Needs little social interaction beyond close friends; values quiet space to reflect.", highLabel: "Needs constant face-to-face interaction; thrives on building relationships and gaining acceptance.", raw: s.energy + s.social / 2 },
        { key: "need_to_achieve", label: "Need to achieve", lowLabel: "Needs an environment focused on relationships; tough decisions and tight deadlines unimportant.", highLabel: "Needs an environment of self-motivation, responsibility and demanding targets.", raw: s.drive + s.risk / 3 },
      ],
    },
  ];
  return groups.map((g) => ({
    category: g.category,
    traits: g.traits.map((t) => ({
      key: t.key,
      label: t.label,
      lowLabel: t.lowLabel,
      highLabel: t.highLabel,
      score: norm(t.raw),
    })),
  }));
}

// ─── Context ─────────────────────────────────────────────────────────────────

function extractContext(qs: Question[], answers: Record<string, Answer>): ContextSummary {
  const tagsFor = (id: string): string[] => {
    const q = qs.find((x) => x.id === id);
    const a = answers[id];
    if (!q?.options || !a?.optionIds) return [];
    return q.options
      .filter((o) => a.optionIds!.includes(o.id))
      .flatMap((o) => (o.tag ? [o.tag] : []));
  };
  const labelFor = (id: string): string => {
    const q = qs.find((x) => x.id === id);
    const a = answers[id];
    if (!q?.options || !a?.optionIds) return "—";
    return q.options
      .filter((o) => a.optionIds!.includes(o.id))
      .map((o) => o.label)
      .join(", ");
  };
  const tagFor = (id: string): string => tagsFor(id)[0] ?? "";

  return {
    budget: labelFor("q13"),
    budgetTag: tagFor("q13"),
    geographies: tagsFor("q12"),
    family: labelFor("q22"),
    familyTag: tagFor("q22"),
    tier: labelFor("q07"),
    tierTag: tagFor("q07"),
    timeline: labelFor("q24"),
    timelineTag: tagFor("q24"),
    dream: answers["q09"]?.text ?? labelFor("q09") ?? "",
  };
}

// ─── Roots dimension prose ───────────────────────────────────────────────────

function dimensionSentence(d: Dimension, v: number): string {
  const meta = DIMENSION_LABELS[d];
  const intensity = Math.abs(v);
  const pole = v >= 0 ? meta.high : meta.low;
  const opp = v >= 0 ? meta.low : meta.high;
  if (intensity < 15) return `Genuinely flexible on ${meta.label.toLowerCase()} — you can play either side without much friction.`;
  if (intensity < 40) return `Lean ${pole.toLowerCase()}, but not all the way. You'll borrow from ${opp.toLowerCase()} when the room calls for it.`;
  if (intensity < 70) return `Clearly ${pole.toLowerCase()}. This is a real preference, not a mood.`;
  return `Strongly ${pole.toLowerCase()}. People who work with you will feel this within an hour.`;
}

// ─── Role clusters ───────────────────────────────────────────────────────────

function routeClusters(
  discipline: StudentProfile["discipline"],
  s: Record<Dimension, number>,
  engagement: EngagementReadout | null,
): RoleCluster[] {
  if (discipline !== "tech_cs") {
    return [{ name: "Coming soon", why: "Discipline-specific clusters for this field land in the next build.", fit: 0 }];
  }
  // Engagement multiplier — low engagement softens technical-track fits.
  const e = engagement ? Math.min(1.2, 0.6 + engagement.score * 0.2) : 1.0;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const clusters: RoleCluster[] = [
    {
      name: "Product Engineer",
      why: "You ship things. You care whether they actually work for someone.",
      fit: clamp((50 + s.drive * 0.4 + s.structure * 0.2 + s.social * 0.2) * e),
    },
    {
      name: "Founding / Early-stage Engineer",
      why: "Ambiguity tolerance is your moat. You'd rather build the path than walk one.",
      fit: clamp((50 + s.risk * 0.5 + s.drive * 0.3 - s.structure * 0.2) * e),
    },
    {
      name: "Systems / Backend Architect",
      why: "Deliberate decisions and structural taste — wasted on UI work.",
      fit: clamp((50 + s.decision_style * 0.4 + s.structure * 0.4) * e),
    },
    {
      name: "Developer Advocate / DevRel",
      why: "Technical depth + people energy. Visible in a way introverts can't be.",
      fit: clamp((50 + s.energy * 0.4 + s.social * 0.3 + s.drive * 0.2) * e),
    },
    {
      name: "Research / Hard-problem track",
      why: "Patience for problems that don't yield in a sprint.",
      fit: clamp((50 + s.structure * 0.3 - s.energy * 0.2 + s.drive * 0.2) * e),
    },
    {
      name: "Solutions / Forward-deployed",
      why: "Half engineer, half consultant. You'd thrive in customer-facing depth.",
      fit: clamp((50 + s.social * 0.4 + s.decision_style * 0.3 + s.drive * 0.2) * e),
    },
    {
      name: "Design Engineer",
      why: "Sit between product and design. Fast iteration with taste.",
      fit: clamp((50 + s.drive * 0.3 + s.structure * 0.1 + Math.abs(s.energy) * 0.2) * e),
    },
  ];
  return clusters.sort((a, b) => b.fit - a.fit).slice(0, 5);
}

// ─── Niche / sub-discipline fields ───────────────────────────────────────────

function extractNiches(
  discipline: StudentProfile["discipline"],
  s: Record<Dimension, number>,
  engagement: EngagementReadout | null,
): Array<{ name: string; tag: string; why: string; fit: number }> {
  if (discipline !== "tech_cs") return [];
  const e = engagement ? Math.min(1.2, 0.6 + engagement.score * 0.2) : 1.0;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const niches = [
    { name: "Developer tooling", tag: "DEVTOOLS", why: "Engineers who build for engineers — leverage compounds.", fit: clamp((52 + s.structure * 0.3 + s.drive * 0.3) * e) },
    { name: "Distributed systems", tag: "DISTSYS", why: "Hard problems, slow feedback, structural taste rewarded.", fit: clamp((50 + s.structure * 0.4 + s.decision_style * 0.3) * e) },
    { name: "ML / applied research", tag: "ML", why: "Sit with a problem that won't yield in a sprint.", fit: clamp((50 + s.structure * 0.25 + s.drive * 0.25 - s.energy * 0.1) * e) },
    { name: "Security / red team", tag: "SECURITY", why: "Adversarial mindset + patient depth.", fit: clamp((50 + s.risk * 0.3 + s.structure * 0.2 + s.decision_style * 0.2) * e) },
    { name: "Frontend / interaction", tag: "FE", why: "Taste-driven craft, fast iteration loops.", fit: clamp((50 + s.drive * 0.3 + Math.max(0, s.energy) * 0.2) * e) },
    { name: "Game / simulation", tag: "GAME", why: "Systems thinking + creative drive in one stack.", fit: clamp((50 + s.drive * 0.35 + s.structure * 0.2 + s.risk * 0.15) * e) },
    { name: "Data engineering", tag: "DATAENG", why: "Pipelines, plumbing, reliability under load.", fit: clamp((50 + s.structure * 0.45 + s.decision_style * 0.2) * e) },
    { name: "Platform / infra", tag: "PLATFORM", why: "Quietly foundational; recognition is delayed.", fit: clamp((50 + s.structure * 0.3 - s.energy * 0.1 + s.drive * 0.2) * e) },
    { name: "Robotics / hardware", tag: "ROBOTICS", why: "Atoms and bits — patience for both.", fit: clamp((50 + s.structure * 0.25 + s.risk * 0.2 + s.drive * 0.2) * e) },
    { name: "Indie / solo product", tag: "INDIE", why: "Total ownership, no committee, modest scale.", fit: clamp((50 + s.risk * 0.4 + s.drive * 0.3 - s.social * 0.2) * e) },
  ];
  return niches.sort((a, b) => b.fit - a.fit).slice(0, 6);
}

// ─── Engagement ──────────────────────────────────────────────────────────────

function extractEngagement(qs: Question[], answers: Record<string, Answer>): EngagementReadout | null {
  const scaleIds = ["q03", "q10", "q13", "q14", "q15", "q18", "q19", "q24"];
  let total = 0;
  let count = 0;
  for (const id of scaleIds) {
    const q = qs.find((x) => x.id === id);
    const a = answers[id];
    if (q && a?.optionIds?.length) {
      const opt = q.options?.find((o) => a.optionIds!.includes(o.id));
      if (opt) {
        const char = opt.id.slice(-1).toLowerCase();
        const score = char === "a" ? 3 : char === "b" ? 2 : char === "c" ? 1 : 0;
        total += score;
        count++;
      }
    }
  }
  if (count === 0) return null;

  const score3 = total / count; // 0 to 3
  const score100 = Math.round((total / (count * 3)) * 100);

  let level: "High" | "Real but quiet" | "Surface-level" | "Disconnected" = "Surface-level";
  let message = "";

  if (score100 >= 75) {
    level = "High";
    message = "You're showing strong readiness across study-abroad indicators: funding, language, digital comfort, and timeline are aligned. You're ready to make your move.";
  } else if (score100 >= 50) {
    level = "Real but quiet";
    message = "You have a solid foundation but some areas need planning. Your timeline or funding might need alignment before final applications.";
  } else if (score100 >= 25) {
    level = "Surface-level";
    message = "You are in the early stages of preparation. Living solo or funding is a work-in-progress, but the direction is right.";
  } else {
    level = "Disconnected";
    message = "Your study-abroad plans are in the very early planning stages. Focus on building language comfort, independence, or clarifying your budget.";
  }

  return {
    score: score3,
    level,
    message
  };
}

// ─── 20+ Stat builder ────────────────────────────────────────────────────────

function buildStats(args: {
  profile: StudentProfile;
  archetype: Archetype;
  dimMap: Record<Dimension, number>;
  context: ContextSummary;
  engagement: EngagementReadout | null;
  routesClusters: RoleCluster[];
}): Stat[] {
  const { archetype, dimMap, context, engagement, routesClusters } = args;
  const s = dimMap;

  const sortedDims = [...Object.entries(s)] as Array<[Dimension, number]>;
  sortedDims.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const top3 = sortedDims.slice(0, 3);
  const bottom3 = sortedDims.slice(-3);

  const stats: Stat[] = [];

  // ─── SELF ─────────────────────────────────────────────────────────
  stats.push({
    key: "archetype",
    section: "self",
    label: "ARCHETYPE",
    value: archetype.name,
    detail: archetype.tagline,
    tone: "positive",
  });

  stats.push({
    key: "cognitive-style",
    section: "self",
    label: "COGNITIVE STYLE",
    value: cognitiveStyleLabel(s),
    detail: cognitiveStyleDetail(s),
  });

  stats.push({
    key: "energy-mode",
    section: "self",
    label: "ENERGY MODE",
    value: energyModeLabel(s),
    detail: energyModeDetail(s),
  });

  stats.push({
    key: "risk-profile",
    section: "self",
    label: "RISK PROFILE",
    value: riskProfileLabel(s.risk),
    detail: riskProfileDetail(s.risk),
    score: scoreToBar(s.risk),
  });

  stats.push({
    key: "social-mode",
    section: "self",
    label: "SOCIAL MODE",
    value: socialModeLabel(s),
    detail: socialModeDetail(s),
  });

  stats.push({
    key: "stress-response",
    section: "self",
    label: "STRESS RESPONSE",
    value: stressResponseLabel(s),
    detail: stressResponseDetail(s),
  });

  stats.push({
    key: "learning-mode",
    section: "self",
    label: "LEARNING MODE",
    value: learningModeLabel(s),
    detail: learningModeDetail(s),
  });

  // Top strengths (1 stat per top-3 dimension)
  top3.forEach(([d, v], i) => {
    const meta = DIMENSION_LABELS[d];
    const pole = v >= 0 ? meta.high : meta.low;
    stats.push({
      key: `strength-${i}`,
      section: "self",
      label: `STRENGTH 0${i + 1}`,
      value: pole,
      detail: dimensionSentence(d, v),
      score: Math.abs(v),
      tone: "positive",
    });
  });

  // Growth edges
  bottom3.forEach(([d, v], i) => {
    const meta = DIMENSION_LABELS[d];
    const opp = v >= 0 ? meta.low : meta.high;
    stats.push({
      key: `edge-${i}`,
      section: "self",
      label: `GROWTH EDGE 0${i + 1}`,
      value: opp,
      detail: growthEdgeSentence(d, v),
      score: 100 - Math.abs(v),
    });
  });

  stats.push({
    key: "team-role",
    section: "self",
    label: "BEST TEAM ROLE",
    value: teamRoleLabel(s),
    detail: teamRoleDetail(s),
  });

  stats.push({
    key: "hidden-talent",
    section: "self",
    label: "HIDDEN TALENT",
    value: hiddenTalent(s).label,
    detail: hiddenTalent(s).detail,
  });

  // ─── FIT ──────────────────────────────────────────────────────────
  routesClusters.slice(0, 3).forEach((c, i) => {
    stats.push({
      key: `cluster-${i}`,
      section: "fit",
      label: `ROLE CLUSTER 0${i + 1}`,
      value: c.name,
      detail: c.why,
      score: c.fit,
      tone: c.fit >= 70 ? "positive" : c.fit >= 50 ? "neutral" : "warning",
    });
  });

  stats.push({
    key: "work-env",
    section: "fit",
    label: "WORK ENVIRONMENT",
    value: workEnvLabel(s),
    detail: workEnvDetail(s),
  });

  stats.push({
    key: "team-size",
    section: "fit",
    label: "TEAM SIZE SWEET SPOT",
    value: teamSizeLabel(s),
    detail: teamSizeDetail(s),
  });

  stats.push({
    key: "manager-type",
    section: "fit",
    label: "MANAGER TYPE",
    value: managerTypeLabel(s),
    detail: managerTypeDetail(s),
  });

  stats.push({
    key: "comp-orientation",
    section: "fit",
    label: "COMPENSATION DRIVER",
    value: compDriverLabel(s),
    detail: compDriverDetail(s),
  });

  stats.push({
    key: "feedback-cadence",
    section: "fit",
    label: "OPTIMAL FEEDBACK",
    value: feedbackCadenceLabel(s),
    detail: feedbackCadenceDetail(s),
  });

  // ─── HONEST SIGNAL ────────────────────────────────────────────────
  if (engagement) {
    stats.push({
      key: "engagement",
      section: "honest",
      label: "ENGAGEMENT LEVEL",
      value: engagement.level,
      detail: engagement.message,
      score: (engagement.score / 3) * 100,
      tone: engagement.score >= 2 ? "positive" : engagement.score === 1 ? "neutral" : "warning",
    });
  }

  stats.push({
    key: "failure-modes",
    section: "honest",
    label: "LIKELY FAILURE MODES",
    value: failureModeLabel(archetype.name, s),
    detail: failureModeDetail(archetype.name, s),
    tone: "warning",
  });

  stats.push({
    key: "pivot-risk",
    section: "honest",
    label: "CAREER PIVOT RISK",
    value: pivotRiskLabel(engagement, s),
    detail: pivotRiskDetail(engagement, s),
    tone: pivotRiskTone(engagement, s),
  });

  // ─── PLAN ─────────────────────────────────────────────────────────
  stats.push({
    key: "budget-reality",
    section: "plan",
    label: "BUDGET vs AMBITION",
    value: budgetRealityLabel(context),
    detail: budgetRealityDetail(context),
    tone: budgetRealityTone(context),
  });

  stats.push({
    key: "family-alignment",
    section: "plan",
    label: "FAMILY ALIGNMENT",
    value: familyLabel(context),
    detail: familyDetail(context),
    tone: familyTone(context),
  });

  stats.push({
    key: "timeline-pressure",
    section: "plan",
    label: "TIMELINE PRESSURE",
    value: timelineLabel(context),
    detail: timelineDetail(context),
    tone: timelineTone(context),
  });

  stats.push({
    key: "next-step-1",
    section: "plan",
    label: "NEXT STEP 01",
    value: nextSteps(args)[0].title,
    detail: nextSteps(args)[0].detail,
  });
  stats.push({
    key: "next-step-2",
    section: "plan",
    label: "NEXT STEP 02",
    value: nextSteps(args)[1].title,
    detail: nextSteps(args)[1].detail,
  });
  stats.push({
    key: "next-step-3",
    section: "plan",
    label: "NEXT STEP 03",
    value: nextSteps(args)[2].title,
    detail: nextSteps(args)[2].detail,
  });

  return stats;
}

// ─── Stat helpers ───────────────────────────────────────────────────────────

function scoreToBar(v: number) { return Math.round(50 + v / 2); }

function cognitiveStyleLabel(s: Record<Dimension, number>): string {
  const d = s.decision_style, st = s.structure;
  if (d > 30 && st > 30) return "Systematic Analyst";
  if (d > 30 && st < -30) return "Deliberate Improviser";
  if (d < -30 && st > 30) return "Intuitive Scaffolder";
  if (d < -30 && st < -30) return "Agile Improviser";
  return "Balanced Operator";
}
function cognitiveStyleDetail(s: Record<Dimension, number>): string {
  return `You combine ${labelOf("decision_style", s.decision_style)} with ${labelOf("structure", s.structure)}. Most useful when the work is ${s.structure > 0 ? "well-scoped" : "ambiguous"} and decisions are ${s.decision_style > 0 ? "reversible-but-careful" : "fast and revisable"}.`;
}

function energyModeLabel(s: Record<Dimension, number>): string {
  const e = s.energy, dr = s.drive;
  if (dr > 40 && e > 30) return "Sustained Sprinter";
  if (dr > 40 && e < -30) return "Quiet Marathoner";
  if (dr < -20 && e > 30) return "Bursty Social";
  if (dr < -20 && e < -20) return "Slow Burner";
  return "Steady Pace";
}
function energyModeDetail(s: Record<Dimension, number>): string {
  return `Your output curve looks like ${s.drive > 30 ? "consistent forward motion" : "intermittent deep dives"}, ${s.energy > 0 ? "topped up by people" : "topped up by solitude"}.`;
}

function riskProfileLabel(v: number): string {
  if (v <= -50) return "Conservative";
  if (v <= -20) return "Cautious";
  if (v < 20) return "Calibrated";
  if (v < 50) return "Bold";
  return "Risk-on";
}
function riskProfileDetail(v: number): string {
  if (v <= -20) return "You'd rather move slow and right than fast and wrong. Optimize environments where mistakes are expensive.";
  if (v < 20) return "You measure risk before taking it. The right environments give you reversible bets, not all-or-nothing ones.";
  return "You'll move before the data is in. Best in environments that reward speed over consensus.";
}

function socialModeLabel(s: Record<Dimension, number>): string {
  const so = s.social, en = s.energy;
  if (so > 40 && en > 30) return "Network Catalyst";
  if (so > 30 && en < -20) return "Embedded Collaborator";
  if (so < -30 && en > 30) return "Public Solo";
  if (so < -30 && en < -30) return "Solo Architect";
  return "Hybrid";
}
function socialModeDetail(s: Record<Dimension, number>): string {
  return `${s.social > 0 ? "You think out loud, with people." : "You think alone, then bring conclusions."} ${s.energy > 0 ? "People top up your battery." : "People drain it; solitude refills it."}`;
}

function stressResponseLabel(s: Record<Dimension, number>): string {
  if (s.decision_style > 30 && s.risk < -10) return "Plan-and-narrow";
  if (s.decision_style > 30 && s.risk > 10) return "Calculate-and-jump";
  if (s.decision_style < -30 && s.risk > 30) return "Jump-and-adapt";
  if (s.structure > 40) return "Routine-and-armor";
  return "Pause-and-recompose";
}
function stressResponseDetail(s: Record<Dimension, number>): string {
  return `Under pressure, you tend to ${s.decision_style > 0 ? "narrow options before acting" : "act first and refine"}, with ${s.structure > 0 ? "routine as a safety net" : "improvisation as your default"}.`;
}

function learningModeLabel(s: Record<Dimension, number>): string {
  if (s.drive > 30 && s.risk > 20) return "Build-first";
  if (s.decision_style > 30 && s.structure > 20) return "Read-first";
  if (s.social > 30) return "Mentor-first";
  if (s.energy > 30) return "Debate-first";
  return "Watch-first";
}
function learningModeDetail(s: Record<Dimension, number>): string {
  if (s.drive > 30 && s.risk > 20) return "You learn fastest by attempting, breaking, and patching. Tutorials lose your attention quickly.";
  if (s.decision_style > 30) return "You consume the manual end-to-end before touching the keyboard. Foundations stick because you laid them.";
  if (s.social > 30) return "You learn through conversation — peer review, pair work, mentor walks. The room is your textbook.";
  return "You absorb by watching others do it first. Best when you can shadow before performing.";
}

function teamRoleLabel(s: Record<Dimension, number>): string {
  if (s.drive > 40 && s.decision_style > 20) return "Driver";
  if (s.structure > 40 && s.decision_style > 20) return "Finisher";
  if (s.social > 30 && s.energy > 20) return "Integrator";
  if (s.risk > 30 && s.drive > 20) return "Visionary";
  return "Supporter";
}
function teamRoleDetail(s: Record<Dimension, number>): string {
  return `In a 5-person team, you'd most often be the one ${s.drive > 30 ? "moving the work forward" : s.structure > 30 ? "making sure it actually ships" : s.social > 30 ? "translating between subgroups" : "holding standards quietly"}.`;
}

function hiddenTalent(s: Record<Dimension, number>): { label: string; detail: string } {
  // Look for non-obvious cross-dim combos.
  if (s.structure > 30 && s.risk > 30) return { label: "Disciplined Risk-taker", detail: "Rare combo: you take big swings inside a clear frame. Most risk-takers are chaotic; most planners are timid. You're neither." };
  if (s.energy < -30 && s.social > 30) return { label: "Quiet Connector", detail: "You don't dominate rooms but people seek you out. Your relationships are deeper than your visibility suggests." };
  if (s.decision_style > 30 && s.drive < -10) return { label: "Patient Architect", detail: "You think slowly and carefully — and the world rewards that less than it should. Find roles where depth, not speed, is the bottleneck." };
  if (s.drive > 40 && s.social < -20) return { label: "Independent Engine", detail: "You don't need a team to push a thing forward. You'll out-produce people with twice your social bandwidth." };
  return { label: "Adaptive Generalist", detail: "Your scores don't peak in one place — and that's a feature. You'll fit roles that need translators between specialist worlds." };
}

// ─── Fit helpers ─────────────────────────────────────────────────────────────

function workEnvLabel(s: Record<Dimension, number>): string {
  if (s.risk > 30 && s.drive > 30) return "Early-stage startup";
  if (s.structure > 40 && s.decision_style > 20) return "Established product company";
  if (s.social > 30 && s.energy > 20) return "Agency / consultancy";
  if (s.risk < -20 && s.structure > 20) return "Lab / research org";
  return "Mid-stage scaleup";
}
function workEnvDetail(s: Record<Dimension, number>): string {
  return `You'll feel underused in ${s.risk > 30 ? "high-process big-co" : "high-chaos zero-process startups"} and overstretched in ${s.risk > 30 ? "" : "fast scrappy startups"}.`;
}

function teamSizeLabel(s: Record<Dimension, number>): string {
  if (s.social < -30) return "Solo or pair";
  if (s.social < 0) return "Squad of 3–5";
  if (s.social < 30) return "Team of 6–10";
  return "Org of 20+";
}
function teamSizeDetail(s: Record<Dimension, number>): string {
  return `You do your best work in groups of about ${s.social < -30 ? "1–2" : s.social < 0 ? "3–5" : s.social < 30 ? "6–10" : "20+"}. Past that, the meta-overhead burns more than it returns.`;
}

function managerTypeLabel(s: Record<Dimension, number>): string {
  if (s.structure < -20 && s.drive > 30) return "High-autonomy / hands-off";
  if (s.structure > 40) return "Structured / weekly 1:1s";
  if (s.social > 30) return "Mentor / coach";
  return "Sparring partner";
}
function managerTypeDetail(s: Record<Dimension, number>): string {
  return `You'd thrive under a manager who ${s.structure < -20 ? "sets direction and gets out of the way" : "gives clear weekly framing"} and is comfortable with ${s.decision_style > 0 ? "deliberate, occasional check-ins" : "frequent, light touches"}.`;
}

function compDriverLabel(s: Record<Dimension, number>): string {
  if (s.risk > 30) return "Equity / upside";
  if (s.drive > 30 && s.structure > 20) return "Cash + scope";
  if (s.social > 30) return "Mission + people";
  return "Learning curve";
}
function compDriverDetail(s: Record<Dimension, number>): string {
  return `What actually moves the needle for you: ${s.risk > 30 ? "outsized future upside, even at cost of present stability" : s.social > 30 ? "the team and the why" : "scope to grow on, with a fair base"}.`;
}

function feedbackCadenceLabel(s: Record<Dimension, number>): string {
  if (s.drive > 30 && s.energy < 0) return "Weekly written";
  if (s.energy > 30) return "Daily verbal";
  if (s.structure > 30) return "Bi-weekly sync";
  return "Async + monthly deep";
}
function feedbackCadenceDetail(s: Record<Dimension, number>): string {
  return `Optimal for you: ${s.energy > 30 ? "short verbal pings often" : "thoughtful written feedback at a steady cadence"}. Avoid environments where reviews land only at quarter-end.`;
}

function failureModeLabel(name: string, s: Record<Dimension, number>): string {
  if (name.includes("Builder")) return "Polish & follow-through";
  if (name.includes("Strategist")) return "Analysis paralysis";
  if (name.includes("Connector")) return "Solo deep work";
  if (name.includes("Maverick")) return "Operating inside structure";
  if (name.includes("Anchor")) return "Self-promotion";
  if (name.includes("Explorer")) return "Commitment depth";
  return s.drive < 0 ? "Initiation" : "Closing things out";
}
function failureModeDetail(name: string, s: Record<Dimension, number>): string {
  if (name.includes("Builder")) return "You ship — but the last 20% of polish, documentation, and stakeholder follow-through tends to lag. Track this; pair with a finisher.";
  if (name.includes("Strategist")) return "You can over-plan when you should ship. Set time-boxes on the analysis phase; trust that early action surfaces information no plan will.";
  if (name.includes("Connector")) return "Deep solo work suffers because you reflexively reach out. Schedule 'no-meeting' days; protect them like any other commitment.";
  if (name.includes("Maverick")) return "Process feels suffocating to you, but it'll be 60% of any real job. Pick environments where you can choose which structure to rebel against.";
  if (name.includes("Anchor")) return "You hold the ground while others get visible. Make peace with the fact that you'll need to advocate for yourself more than your peers do.";
  if (name.includes("Explorer")) return "You get bored fast. Two-year commitments are where compounding happens — practice staying past the point of novelty.";
  return "Watch the gap between what you start and what you complete. Build a closing ritual into your week.";
}

function pivotRiskLabel(e: EngagementReadout | null, s: Record<Dimension, number>): string {
  if (!e) return "Unknown";
  if (e.score >= 3 && s.drive > 0) return "Low";
  if (e.score === 2) return "Moderate";
  if (e.score <= 1) return "High";
  return "Moderate";
}
function pivotRiskDetail(e: EngagementReadout | null, _s: Record<Dimension, number>): string {
  if (!e) return "We need the engagement check to read this.";
  if (e.score >= 3) return "Your stated path matches your lived behavior. You're unlikely to swap fields in the first 24 months.";
  if (e.score === 2) return "Some signal, but not enough to be sure. Run a 4-week experiment in your stated field before committing irreversibly.";
  return "Strong signal you may be in the wrong field on paper. This is the conversation to have before applications, not after.";
}
function pivotRiskTone(e: EngagementReadout | null, _s: Record<Dimension, number>): "positive" | "neutral" | "warning" {
  if (!e) return "neutral";
  if (e.score >= 3) return "positive";
  if (e.score === 2) return "neutral";
  return "warning";
}

// ─── Plan helpers ────────────────────────────────────────────────────────────

function budgetRealityLabel(c: ContextSummary): string {
  if (c.tierTag.includes("global-top") && c.budgetTag.includes("<5L")) return "Significant gap";
  if (c.tierTag.includes("global-top") && c.budgetTag.includes("5-15L")) return "Stretched";
  if (c.tierTag.includes("global-mid") && c.budgetTag.includes("<5L")) return "Tight";
  if (c.tierTag.includes("in-fit") && c.budgetTag.includes("30L+")) return "Over-resourced";
  return "Aligned";
}
function budgetRealityDetail(c: ContextSummary): string {
  if (c.tierTag.includes("global-top") && (c.budgetTag.includes("<5L") || c.budgetTag.includes("5-15L"))) return "Top global colleges run ₹35–60L/yr. Plan for hard scholarship hunting, financial aid, or recalibrate the tier ambition early.";
  if (c.tierTag.includes("in-fit") && c.budgetTag.includes("30L+")) return "Your budget exceeds the bar for the tier you're aiming at. Worth re-asking whether the prestige delta would matter to you.";
  return "Budget and tier ambition look broadly aligned. Focus on fit over prestige inside that tier.";
}
function budgetRealityTone(c: ContextSummary): "positive" | "neutral" | "warning" {
  const lbl = budgetRealityLabel(c);
  if (lbl === "Aligned") return "positive";
  if (lbl === "Significant gap" || lbl === "Stretched") return "warning";
  return "neutral";
}

function familyLabel(c: ContextSummary): string {
  if (c.familyTag.includes("free")) return "Total freedom";
  if (c.familyTag.includes("opinions")) return "Discuss-able";
  if (c.familyTag.includes("specific")) return "Constrained";
  if (c.familyTag.includes("locked")) return "Locked";
  return "Unclear";
}
function familyDetail(c: ContextSummary): string {
  if (c.familyTag.includes("locked")) return "You're not picking from open-ended options. Build the case using credible sources (data, alumni, salary outcomes) — emotion-driven appeals will not move the needle.";
  if (c.familyTag.includes("specific")) return "You'll need to demonstrate the alternative is at least equivalent on the metrics they care about (jobs, salary, prestige). Bring receipts to the conversation.";
  if (c.familyTag.includes("opinions")) return "Healthy frame. Lead with your reasoning, leave room for theirs. The conversation is real, not a battle.";
  return "Total freedom is rare and double-edged — you'll need to provide your own constraints.";
}
function familyTone(c: ContextSummary): "positive" | "neutral" | "warning" {
  if (c.familyTag.includes("free")) return "positive";
  if (c.familyTag.includes("locked")) return "warning";
  return "neutral";
}

function timelineLabel(c: ContextSummary): string {
  if (c.timelineTag === "tl:now") return "Compressed";
  if (c.timelineTag === "tl:1y") return "On schedule";
  if (c.timelineTag === "tl:2y") return "Comfortable";
  return "Open-ended";
}
function timelineDetail(c: ContextSummary): string {
  if (c.timelineTag === "tl:now") return "6-month windows reward boldness and decisiveness — not exploration. Lock the shortlist this month; convert by month 3.";
  if (c.timelineTag === "tl:1y") return "You have time to be surgical. Use Q1 to explore, Q2 to shortlist, Q3 to apply with quality.";
  if (c.timelineTag === "tl:2y") return "Long runway. Highest leverage now is depth — projects, recommendations, story — not list-building.";
  return "Use this season to gather signal rather than make commitments. Speak to alumni, do trial weeks, write a 1-pager.";
}
function timelineTone(c: ContextSummary): "positive" | "neutral" | "warning" {
  if (c.timelineTag === "tl:now") return "warning";
  if (c.timelineTag === "tl:open") return "neutral";
  return "positive";
}

function nextSteps(args: {
  archetype: Archetype;
  context: ContextSummary;
  engagement: EngagementReadout | null;
  routesClusters: RoleCluster[];
}): Array<{ title: string; detail: string }> {
  const top = args.routesClusters[0];
  return [
    {
      title: `Talk to a "${top?.name ?? "field"}" alum`,
      detail: `Secure Steps will route you to one within a week — bring 3 specific questions about how they spend their day, not the resume version.`,
    },
    {
      title: args.engagement && args.engagement.score < 2
        ? "Run a 4-week field experiment"
        : "Build one project end-to-end",
      detail: args.engagement && args.engagement.score < 2
        ? "Your engagement signal is soft. Pick a 30-day, low-stakes experiment in your stated field before committing. We'll help scope it."
        : "Pick a small, finishable project that actually ships to one user in 30 days. Resume credibility, but more importantly — proof for yourself.",
    },
    {
      title: args.context.familyTag.includes("locked") || args.context.familyTag.includes("specific")
        ? "Prepare the family conversation"
        : "Shortlist 8 colleges that match",
      detail: args.context.familyTag.includes("locked") || args.context.familyTag.includes("specific")
        ? "Build a one-pager: outcomes, alumni, salary, fit. Schedule the conversation; don't ambush. Bring an advisor if helpful."
        : "Use the Routes role clusters above + your tier/budget/geo constraints. Your Secure Steps counsellor will validate — keep the list tight.",
    },
  ];
}

function growthEdgeSentence(d: Dimension, v: number): string {
  const meta = DIMENSION_LABELS[d];
  const opp = v >= 0 ? meta.low : meta.high;
  return `You under-use "${opp.toLowerCase()}". Not a flaw — but environments that demand it will feel costlier than they should until you build the muscle.`;
}

function labelOf(d: Dimension, v: number): string {
  const meta = DIMENSION_LABELS[d];
  return (v >= 0 ? meta.high : meta.low).toLowerCase();
}
