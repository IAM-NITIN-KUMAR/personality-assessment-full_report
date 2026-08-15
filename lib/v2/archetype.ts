import { ANIMALS, DIM_PRIORITY } from "./types";
import type { ArchetypeResult, DomainId, RadarDim, RadarScores } from "./types";

export const DOMAIN_TIEBREAK: Record<DomainId, RadarDim[]> = {
  finance: ["analytical", "practical"],
  business: ["leadership", "practical"],
  entrepreneurship: ["entrepreneurial", "creative"],
  technology: ["analytical", "creative"],
  people_society: ["people", "leadership"],
};

export function pairKey(a: RadarDim, b: RadarDim): string {
  return [a, b].sort().join("+");
}

interface GridEntry { name: string; rendering: string; strapline: string; straplineInstinctive?: string }

// Spec §6 grid, verbatim. straplineInstinctive stays empty until copy exists (Decision 11).
export const ARCHETYPE_GRID: Record<string, GridEntry> = {
  [pairKey("analytical", "practical")]: {
    name: "The Auditor", rendering: "Hawk with an Elephant's discipline",
    strapline: "You see the hole in the plan before anyone else does.",
  },
  [pairKey("analytical", "creative")]: {
    name: "The Architect", rendering: "Hawk with a Peacock's eye",
    strapline: "You don't just solve it. You design the solution.",
  },
  [pairKey("analytical", "leadership")]: {
    name: "The Strategist", rendering: "Hawk with a Lion's nerve",
    strapline: "You play the long game while everyone plays the loud one.",
  },
  [pairKey("analytical", "people")]: {
    name: "The Advisor", rendering: "Hawk with a Dolphin's warmth",
    strapline: "People bring you their hardest questions for a reason.",
  },
  [pairKey("analytical", "entrepreneurial")]: {
    name: "The Prospector", rendering: "Hawk with a Tiger's hunger",
    strapline: "You find the opportunity hiding inside the numbers.",
  },
  [pairKey("creative", "leadership")]: {
    name: "The Visionary", rendering: "Peacock with a Lion's voice",
    strapline: "You see what it could be, and you make others see it too.",
  },
  [pairKey("creative", "people")]: {
    name: "The Storyteller", rendering: "Peacock with a Dolphin's ear",
    strapline: "You make people feel what they'd otherwise scroll past.",
  },
  [pairKey("creative", "practical")]: {
    name: "The Maker", rendering: "Peacock with an Elephant's hands",
    strapline: "You'd rather build the thing than talk about the thing.",
  },
  [pairKey("creative", "entrepreneurial")]: {
    name: "The Creator", rendering: "Peacock with a Tiger's timing",
    strapline: "You start things. That's the whole sentence.",
  },
  [pairKey("leadership", "people")]: {
    name: "The Captain", rendering: "Lion with a Dolphin's read",
    strapline: "Teams don't follow your title. They follow you.",
  },
  [pairKey("leadership", "practical")]: {
    name: "The Operator", rendering: "Lion with an Elephant's patience",
    strapline: "You're why the plan actually happens.",
  },
  [pairKey("leadership", "entrepreneurial")]: {
    name: "The Pioneer", rendering: "Lion with a Tiger's appetite",
    strapline: "First in, and comfortable there.",
  },
  [pairKey("people", "practical")]: {
    name: "The Anchor", rendering: "Dolphin with an Elephant's calm",
    strapline: "Everything holds because you hold it.",
  },
  [pairKey("people", "entrepreneurial")]: {
    name: "The Connector", rendering: "Dolphin with a Tiger's reach",
    strapline: "You know someone for everything, and everyone knows you.",
  },
  [pairKey("practical", "entrepreneurial")]: {
    name: "The Builder", rendering: "Elephant with a Tiger's pace",
    strapline: "Less talk. More done.",
  },
};

export const EXPLORER_COPY =
  "Your pull is real in several directions at once, and none of them is fake. This usually means one of two things: you are a genuine bridge profile who will thrive in roles that translate between specialist worlds, or you haven't yet met the work that takes over. The fastest way to find out is exposure, not another test. Your next 90 days matter more than your result today.";

export const MORE_SIGNAL_COPY =
  "We're not going to pretend. Your answers didn't give us enough to name your type honestly, and a made-up label would waste your time. This happens for about one student in five, and it usually means the questions met you before the experiences did.";

/** All six dims in deterministic order: score desc, then C1 alignment, then fixed priority. */
export function orderDims(radar: RadarScores, chosenDomain: DomainId | null): RadarDim[] {
  const align = chosenDomain ? DOMAIN_TIEBREAK[chosenDomain] : [];
  const rank = (d: RadarDim) => {
    const a = align.indexOf(d);
    return a === -1 ? align.length : a;
  };
  return [...DIM_PRIORITY].sort(
    (a, b) =>
      radar[b] - radar[a] ||
      rank(a) - rank(b) ||
      DIM_PRIORITY.indexOf(a) - DIM_PRIORITY.indexOf(b),
  );
}

export function computeArchetypeV2(
  radar: RadarScores,
  chosenDomain: DomainId | null,
): ArchetypeResult {
  const values = Object.values(radar);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const zeros = values.filter((v) => v === 0).length;

  // 1. thin-signal check
  if (max <= 6 || zeros >= 3) return { kind: "more_signal", copy: MORE_SIGNAL_COPY };
  // 2. flat check
  if (min >= 4 && max - min <= 4) return { kind: "explorer", copy: EXPLORER_COPY };
  // 3. pair top two
  const [primary, secondary] = orderDims(radar, chosenDomain);
  const entry = ARCHETYPE_GRID[pairKey(primary, secondary)];
  return {
    kind: "archetype",
    primary,
    secondary,
    name: entry.name,
    animal: ANIMALS[primary].name,
    rendering: entry.rendering,
    strapline: entry.strapline,
  };
}
