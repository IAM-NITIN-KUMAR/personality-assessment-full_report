import { computeRadar } from "./scoring/radar";
import { computeSliders } from "./scoring/sliders";
import { computeDefaultPathFlag, selectC1Cards } from "./scoring/domains";
import { resolveRole } from "./scoring/roles";
import { confBand, confTotal } from "./scoring/confirmation";
import { computeArchetypeV2 } from "./archetype";
import { buildCards } from "./careers/cards";
import { slotVerdicts } from "./verdicts";
import { UNIVERSAL_TIPS, evaluateFlags } from "./flags";
import { chosenDomain, degreeOf } from "./flow";
import { showAbroad } from "./gate";
import { ROLE_LABELS, VALUE_BY_KEY, VALUE_LABELS } from "./types";
import type { ReportV2, SlidersResult, V2Answers, ValueId } from "./types";

export function profileIdFor(name: string, email: string, dateISO: string): string {
  const s = `${name}|${email}|${dateISO}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  const [y, m] = dateISO.split("-");
  return `SS-${m}${y}-${String(h % 10000).padStart(4, "0")}`;
}

// DRAFT copy except ✓-marked sample lines (see plan Task 14 table).
const ENERGY_LINES: Record<string, string> = {
  "Clearly Outgoing": "You recharge with people and your best work has an audience.",
  "Lean Outgoing": "People give you energy more often than they take it.",
  "Clearly Reflective": "You recharge alone and your deepest work happens there.",
  "Lean Reflective": "You do your best thinking away from the noise.",
  Balanced: "You flex between the room and the quiet, depending on the work.",
};
const DECISION_LINES: Record<string, string> = {
  "Clearly Deliberate": "You compare before you commit, even with a deadline breathing.",
  "Lean Deliberate": "You lean toward checking twice before you move.",
  "Clearly Instinctive": "You commit fast and correct course as you go.",
  "Lean Instinctive": "You trust your gut first and the sheet second.",
  Balanced: "You switch between gut and analysis depending on the stakes.",
};
const STRUCTURE_LINES: Record<string, string> = {
  "Clearly Structured": "You work best with a clear frame and visible milestones.",
  "Lean Structured": "You like a frame, and you'll leave it when the room calls for it.",
  "Clearly Open-ended": "Give you the goal, not the steps — you'll find the way.",
  "Lean Open-ended": "You'd rather define the path than follow one.",
  Balanced: "You can run with a plan or without one; the work decides.",
};
const MOBILITY_LINES: Record<string, { heading: string; sentence: string }> = {
  global: { heading: "Global mover", sentence: "The right opportunity outweighs the map." },
  national: { heading: "National mover", sentence: "You'd move anywhere in India for the right thing." },
  conditional: { heading: "Conditional mover", sentence: "You'd relocate, but only for something exceptional." },
  rooted: { heading: "Rooted", sentence: "You build best where your life already is." },
};

const QUALIFIER: Record<ValueId, string> = {
  meaning: "mission-driven", mastery: "deep-specialist", freedom: "flexible",
  relationships: "closer-to-home", health: "low-burnout", money: "funded, affordable",
};
const SUFFIX: Record<ValueId, string> = {
  meaning: "", mastery: "", freedom: "", money: "",
  relationships: " with strong communities", health: " in sane working cultures",
};

function heading(band: string, side?: string): string {
  return band === "Balanced" ? "Balanced" : `${band} ${side}`;
}

function coreStrengths(sliders: SlidersResult): ReportV2["coreStrengths"] {
  const e = heading(sliders.energy.band, sliders.energy.side);
  const d = heading(sliders.decision.band, sliders.decision.side);
  const st = heading(sliders.structure.band, sliders.structure.side);
  const mob = sliders.mobility ? MOBILITY_LINES[sliders.mobility] : { heading: "Balanced", sentence: "" };
  return [
    { label: "Energy", heading: e, sentence: ENERGY_LINES[e], sourceIds: ["A1", "A2"] },
    { label: "Decision", heading: d, sentence: DECISION_LINES[d], sourceIds: ["A3", "A4"] },
    { label: "Structure", heading: st, sentence: STRUCTURE_LINES[st], sourceIds: ["A5", "A6"] },
    { label: "Mobility", heading: mob.heading, sentence: mob.sentence, sourceIds: ["A7"] },
  ];
}

function valueOf(answers: V2Answers, id: "E1" | "E2"): ValueId | null {
  const k = answers[id]?.[0];
  return k ? VALUE_BY_KEY[k as keyof typeof VALUE_BY_KEY] : null;
}

export function buildReportV2(input: {
  name: string; email?: string; dateISO: string; answers: V2Answers;
}): ReportV2 {
  const { name, email = "", dateISO, answers } = input;
  const degree = degreeOf(answers) ?? "other";
  const radar = computeRadar(answers);
  const sliders = computeSliders(answers);
  const domain = chosenDomain(answers);
  const { seededTop2 } = selectC1Cards(radar, degree);
  const defaultPathFlag = domain ? computeDefaultPathFlag(domain, degree, seededTop2) : false;

  const role = domain ? resolveRole(domain, answers) : null;
  const conf = confTotal(answers);
  const band = confBand(conf);
  const archetype = computeArchetypeV2(radar, domain);
  // A null domain (C1 unanswered) means there is no winning role and therefore no cards/verdicts to
  // show — that's exactly the "not enough signal yet" state, so it folds into moreSignal here rather
  // than leaving state === "full" with cards === null (see report-view.tsx / report-pdf.tsx crash).
  const moreSignal = archetype.kind === "more_signal" || domain === null;

  const cards = !moreSignal && domain && role
    ? buildCards({
        domain, radar, roleScores: role.scores, ranked: role.ranked,
        winner: role.winner, coCandidate: role.coCandidate, conf, degree,
      })
    : null;

  const verdicts = moreSignal ? [] : slotVerdicts({
    answers, radar, sliders, domain, winner: role?.winner ?? null, confTotal: conf, defaultPathFlag,
  });

  const flags = evaluateFlags({
    answers, radar, degree, seededTop2, chosenDomain: domain,
    winner: role?.winner ?? null, confBand: band, archetype, defaultPathFlag,
  });
  const growthTips = flags.length > 0 ? flags.map((f) => f.tip) : [...UNIVERSAL_TIPS];

  const family = ["c", "d"].includes(answers.E3?.[0] ?? "");
  const roleLabel = role ? ROLE_LABELS[role.winner] : "your top field";
  const counselling = moreSignal
    ? "A 1:1 counselling session to plan your first real exposure — that will tell us more than this result can."
    : `A 1:1 session on ${roleLabel}${role?.coCandidate ? ` vs ${ROLE_LABELS[role.coCandidate]}` : ""} pathways${family ? ", with your family in the room" : ""}.`;
  const exposure = answers.F1?.[0] === "a" || answers.F1?.[0] === "b"
    ? `One real project or internship in ${roleLabel.toLowerCase()} before the term ends.`
    : `One deeper project in ${roleLabel.toLowerCase()} — you have exposure; now aim it.`;
  const conversation = answers.F2?.[0] === "a" || answers.F2?.[0] === "b"
    ? `One conversation with a working ${roleLabel.toLowerCase()} professional before month-end.`
    : `Keep the conversations going — ask the next one what they'd study today.`;

  let abroad: string | undefined;
  const f4 = answers.F4?.[0];
  if (showAbroad(answers) && (f4 === "a" || f4 === "b")) {
    const anchor = valueOf(answers, "E1");
    const keystone = valueOf(answers, "E2");
    const openness = f4 === "a" ? "set on" : "open to";
    const q = anchor ? QUALIFIER[anchor] : "well-matched";
    const suffix = keystone ? SUFFIX[keystone] : "";
    const protects = anchor
      ? ` and you protect ${VALUE_LABELS[anchor]}${keystone ? ` with ${VALUE_LABELS[keystone]} as your keystone` : ""}`
      : "";
    abroad = `You're ${openness} studying abroad${protects}, so your shortlist will be weighted toward ${q} programmes${suffix}.`;
  }

  return {
    header: {
      name,
      profileId: profileIdFor(name, email, dateISO),
      date: dateISO,
      assessmentName: "Secure Steps · Roots & Routes",
    },
    state: moreSignal ? "more_signal" : "full",
    yourType: archetype,
    coreStrengths: coreStrengths(sliders),
    radar,
    cards,
    verdicts,
    growthTips,
    nextSteps: { counselling, exposure, conversation, ...(abroad ? { abroad } : {}) },
    flags,
    role: role ? { winner: role.winner, coCandidate: role.coCandidate, confTotal: conf, confBand: band } : null,
    domain,
  };
}
