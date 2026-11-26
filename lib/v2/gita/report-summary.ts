import { DIM_LABELS, DOMAIN_LABELS, ROLE_LABELS } from "../types";
import type { RadarDim, ReportV2 } from "../types";
import type { ReportData } from "../../report-data";

/**
 * What the "Ask the Gita" chat is told about a student's report.
 *
 * The header (name, profile ID, date) is left out on purpose: nothing that
 * identifies the student leaves the browser. The chat service turns each key
 * into a label, so keys are plain words, and it reads at most about 4,000
 * characters, so the most useful facts come first and lists are kept short.
 */
export type GitaReportSummary = Record<string, unknown>;

const DIMS: RadarDim[] = ["analytical", "people", "creative", "entrepreneurial", "practical", "leadership"];

/** D1/D2 asked how the student felt about the day-to-day cost of the winning role. */
const DAILY_COST_REACTION: Record<"confirmed" | "provisional" | "mismatch", string> = {
  confirmed: "interest held firm after seeing the day-to-day cost of this role",
  provisional: "interest held only partly after seeing the day-to-day cost of this role",
  mismatch: "said the day-to-day cost of this role would be hard to accept",
};

export function gitaReportSummary(report: ReportV2): GitaReportSummary {
  // Same rule as the report itself: the more_signal state never names a type, a role or a fit %.
  const full = report.state === "full";
  const t = report.yourType;
  const out: GitaReportSummary = {
    assessment: "Secure Steps Roots & Routes, a personality and career-fit assessment for students",
  };

  if (full && t.kind === "archetype") {
    out.result = `${t.name} (${t.rendering}). ${t.strapline}`;
  } else if (full && t.kind === "explorer") {
    out.result = `The Explorer. ${t.copy}`;
  } else {
    out.result = "Not enough signal yet to name a type. The report says so plainly and gives next steps instead.";
  }

  if (full && report.domain) out.chosen_direction = DOMAIN_LABELS[report.domain];
  if (full && report.role) {
    out.best_fit_role = ROLE_LABELS[report.role.winner];
    if (report.role.coCandidate) out.close_second_role = ROLE_LABELS[report.role.coCandidate];
    out.role_check = DAILY_COST_REACTION[report.role.confBand];
  }

  if (full && report.cards) {
    out.career_matches = report.cards.slice(0, 2).map((c) => ({
      career: c.career,
      fit_percent: c.fit,
      what_it_is: c.whatLine,
      ...(c.honestyLine ? { caution: c.honestyLine } : {}),
    }));
    const others = report.cards.slice(2, 4).map((c) => c.career);
    if (others.length) out.other_pathways = others;
  }

  out.working_style = report.coreStrengths
    .filter((s) => s.sentence)
    .map((s) => ({ trait: s.label, reading: s.heading, meaning: s.sentence }));

  if (full) {
    out.scores_out_of_10 = Object.fromEntries(DIMS.map((d) => [DIM_LABELS[d], report.radar[d]]));
  }

  if (report.verdicts.length) out.observations = report.verdicts.slice(0, 3).map((v) => v.line);
  out.growth_tips = report.growthTips.slice(0, 3);
  out.next_steps = [report.nextSteps.counselling, report.nextSteps.exposure, report.nextSteps.conversation];
  if (report.nextSteps.abroad) out.studying_abroad = report.nextSteps.abroad;

  const th = report.thinking;
  if (th) {
    out.thinking_about_next_step = {
      where_they_started: th.started,
      starting_confidence_out_of_5: Number(th.confidence.average.toFixed(1)),
      beliefs_worth_testing: `${th.assumptions.total} of 12 (${th.assumptions.band.toLowerCase()})`,
      [th.saved ? "conclusions_in_their_own_words" : "suggested_conclusions"]: [...th.conclusions],
      plain_next_step: th.gap.next,
    };
  }
  // Without a thinking page, the three starting-point answers are what is known about where they began.
  const sp = report.startingPoint;
  if (sp && !th) {
    out.starting_point = {
      ...(sp.reason ? { main_reason_for_their_current_choice: sp.reason } : {}),
      ...(sp.workplace ? { workplace_they_picture: sp.workplace } : {}),
      ...(sp.missing.length ? { what_they_feel_is_still_missing: sp.missing } : {}),
    };
  }
  return out;
}

/**
 * Up to three first-person openers for the chat, picked from what this report
 * flagged, so a student who does not know what to type sees their own situation.
 */
export function gitaStarters(report: ReportV2): string[] {
  const full = report.state === "full";
  const flags = new Set(report.flags.map((f) => f.id));
  const out: string[] = [];

  const [first, second] = full && report.cards ? report.cards : [];
  if (first && second) out.push(`I'm torn between ${first.career} and ${second.career}.`);
  if (flags.has("family")) out.push("My family has a big say in this decision, and I'm not sure what I want.");
  if (flags.has("constraint_conflict")) out.push("The path that fits me costs something I care about.");
  if (flags.has("default_path")) out.push("I think I picked the expected path, not my own.");
  if (flags.has("divergence")) out.push("My degree and my nature seem to point in different directions.");
  if (full && report.role?.confBand === "mismatch") out.push("The daily reality of the path I picked scares me.");
  if (!full) out.push("I still don't know what I want.");
  out.push("I'm afraid of choosing wrong.", "I'm scared I will fail.", "How do I stop comparing myself with others?");

  return [...new Set(out)].slice(0, 3);
}

// ---------------------------------------------------------------------------
// School report (classes 10 to 12): same idea, built from the legacy ReportData.
// ---------------------------------------------------------------------------

export function gitaLegacySummary(data: ReportData): GitaReportSummary {
  const out: GitaReportSummary = {
    assessment: "Secure Steps Roots & Routes, a personality and career-fit assessment for students",
    student_level: data.profile.educationLevel === "10th_12th" ? "school student, class 10 to 12" : "college student",
    result: `${data.archetype.name}. ${data.archetype.tagline} ${data.archetype.description}`,
    match_score_percent: data.matchScore,
  };
  if (data.coreThemes.length) out.core_themes = data.coreThemes.slice(0, 6);

  out.top_degrees = data.topDegrees.slice(0, 3).map((d) => ({ degree: d.title, match_percent: d.match, why: d.why }));
  const others = data.alternativeDegrees.slice(0, 3).map((d) => d.title);
  if (others.length) out.other_pathways = others;

  const honest = data.stats.filter((s) => s.section === "honest").slice(0, 3);
  if (honest.length) out.honest_readings = honest.map((s) => ({ reading: `${s.label}: ${s.value}`, meaning: s.detail }));

  out.drivers = data.drivers.slice(0, 5).map((d) => ({ driver: d.category, reading: d.label, meaning: d.description }));
  if (data.engagement) out.engagement = `${data.engagement.level}. ${data.engagement.message}`;

  const context: Record<string, string> = {};
  if (data.context.family) context.family_situation = data.context.family;
  if (data.context.dream) context.stated_dream = data.context.dream;
  if (data.context.timeline) context.timeline = data.context.timeline;
  if (Object.keys(context).length) out.what_the_student_told_us = context;
  return out;
}

export function gitaLegacyStarters(data: ReportData): string[] {
  const out: string[] = [];
  const [first, second] = data.topDegrees;
  if (first && second) out.push(`I am torn between ${first.title} and ${second.title}.`);
  out.push("I am afraid of choosing the wrong course.", "I am scared I will fail.", "How do I stop comparing myself with others?");
  return [...new Set(out)].slice(0, 3);
}
