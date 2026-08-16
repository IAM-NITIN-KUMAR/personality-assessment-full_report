// Roots & Routes v2 engine types. All weights/tables that reference these are
// calibration seeds (spec v2, end note).

export type Degree = "engineering" | "commerce" | "science" | "arts" | "other";

export type RadarDim =
  | "analytical"
  | "people"
  | "creative"
  | "entrepreneurial"
  | "practical"
  | "leadership";

export type RadarScores = Record<RadarDim, number>;

/** Fixed tie-break priority (spec §5/§6). */
export const DIM_PRIORITY: RadarDim[] = [
  "analytical", "practical", "people", "creative", "entrepreneurial", "leadership",
];

export const DIM_LABELS: Record<RadarDim, string> = {
  analytical: "Analytical",
  people: "People Skills",
  creative: "Creative",
  entrepreneurial: "Entrepreneurial",
  practical: "Practical",
  leadership: "Leadership",
};

export type DomainId =
  | "finance"
  | "business"
  | "entrepreneurship"
  | "technology"
  | "people_society";

export const DOMAIN_ORDER: DomainId[] = [
  "finance", "business", "entrepreneurship", "technology", "people_society",
];

export const DOMAIN_LABELS: Record<DomainId, string> = {
  finance: "Finance & Capital",
  business: "Business & Management",
  entrepreneurship: "Entrepreneurship & Product",
  technology: "Technology & Data",
  people_society: "People & Society",
};

export type RoleId =
  | "markets" | "deals" | "risk" | "advisory"
  | "operations" | "strategy" | "growth" | "people_hr"
  | "founder" | "product" | "sales" | "operator"
  | "build" | "data" | "product_tech" | "infrastructure"
  | "psychology" | "education" | "policy" | "community";

export const ROLE_LABELS: Record<RoleId, string> = {
  markets: "Markets", deals: "Deals", risk: "Risk", advisory: "Advisory",
  operations: "Operations", strategy: "Strategy", growth: "Growth", people_hr: "People & HR",
  founder: "Founder", product: "Product", sales: "Sales", operator: "Operator",
  build: "Build", data: "Data", product_tech: "Product-Tech", infrastructure: "Infrastructure",
  psychology: "Psychology", education: "Education", policy: "Policy", community: "Community",
};

/** E1/E2 value options, in on-screen order. */
export type ValueId = "meaning" | "mastery" | "freedom" | "relationships" | "health" | "money";
export const VALUE_LABELS: Record<ValueId, string> = {
  meaning: "Meaning", mastery: "Mastery", freedom: "Freedom",
  relationships: "Relationships", health: "Health", money: "Money",
};

/** E1/E2 option key → value, in on-screen order (Meaning · Mastery · Freedom · Relationships · Health · Money). */
export const VALUE_BY_KEY: Record<"a" | "b" | "c" | "d" | "e" | "f", ValueId> = {
  a: "meaning", b: "mastery", c: "freedom", d: "relationships", e: "health", f: "money",
};

export type OptionKey = "a" | "b" | "c" | "d" | "e" | "f";

export type BItem = "B1" | "B2" | "B3" | "B4" | "B5" | "B6";

export type ScreenId =
  | "Q0"
  | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7"
  | BItem
  | "C1" | "C2" | "C3" | "C4" | "C5"
  | "D1" | "D2"
  | "E1" | "E2" | "E3"
  | "F1" | "F2" | "F3" | "F4"
  | "F5a" | "F5b" | "F5c";

/** Answers keyed by screen id. Single-select screens store one key; F5a (countries) stores many. */
export type V2Answers = Partial<Record<ScreenId, OptionKey[]>>;

export type SliderName = "energy" | "decision" | "structure";
export type Band = "Clearly" | "Lean" | "Balanced";

export interface SliderResult {
  band: Band;
  /** Side label ("Outgoing", "Reflective", "Deliberate", "Instinctive", "Structured", "Open-ended"). Undefined when Balanced. */
  side?: string;
}

export type Mobility = "global" | "national" | "conditional" | "rooted";

export interface SlidersResult {
  energy: SliderResult;
  decision: SliderResult;
  structure: SliderResult;
  mobility: Mobility | undefined;
}

export const ANIMALS: Record<RadarDim, { name: string; line: string }> = {
  analytical: { name: "Hawk", line: "Sees the detail from a distance that others miss. Baaz ki nazar." },
  practical: { name: "Elephant", line: "Steady, remembers everything, carries what others can't. Never rushed, never late." },
  leadership: { name: "Lion", line: "Doesn't chase the room's approval. The room organises around it." },
  people: { name: "Dolphin", line: "Reads the group, moves with it, lifts it. Insight that works through connection." },
  creative: { name: "Peacock", line: "Makes the thing nobody asked for and everybody remembers." },
  entrepreneurial: { name: "Tiger", line: "Hunts alone, picks its moment, commits fully. The opportunist, in the best sense." },
};

export type ArchetypeResult =
  | {
      kind: "archetype";
      primary: RadarDim;
      secondary: RadarDim;
      name: string;              // "The Auditor"
      animal: string;            // "Hawk"
      rendering: string;         // "Hawk with an Elephant's discipline"
      strapline: string;
    }
  | { kind: "explorer"; copy: string }
  | { kind: "more_signal"; copy: string };

export interface CareerCard {
  kind: "primary" | "secondary" | "cross_branch" | "honest_low";
  role: RoleId;
  career: string;      // "Risk Analyst"
  fit: number;         // 5..95
  whatLine: string;
  nextStep: string;
  honestyLine?: string; // card 1 only, when conf_total <= -2
}

export type FlagId =
  | "romanticism" | "default_path" | "divergence" | "preparation_gap"
  | "conversation_gap" | "family" | "constraint_conflict" | "thin_signal";

export interface FiredFlag {
  id: FlagId;
  tip: string;
}

export type VerdictId =
  | "V1" | "V2" | "V3" | "V4"
  | "L1" | "L2" | "L3" | "L4"
  | "S1" | "S2" | "S3" | "S4"
  | "P1" | "P2" | "P3" | "P4"
  | "H1" | "H2" | "H3" | "H4";

export interface Verdict {
  id: VerdictId;
  line: string;
}

export interface ReportV2 {
  header: { name: string; profileId: string; date: string; assessmentName: string };
  state: "full" | "more_signal";
  yourType: ArchetypeResult;
  coreStrengths: {
    label: string;          // "Energy" | "Decision" | "Structure" | "Mobility"
    heading: string;        // "Clearly Reflective" / "Conditional mover"
    sentence: string;
    sourceIds: ScreenId[];  // e.g. ["A1","A2"]
  }[];
  radar: RadarScores;
  /** null in the more_signal state — never render fit % there. */
  cards: CareerCard[] | null;
  verdicts: Verdict[];
  growthTips: string[];
  nextSteps: { counselling: string; exposure: string; conversation: string; abroad?: string };
  flags: FiredFlag[];
  /** For the report body: winning role + co-candidate if any. */
  role: { winner: RoleId; coCandidate: RoleId | null; confTotal: number; confBand: "confirmed" | "provisional" | "mismatch" } | null;
  domain: DomainId | null;
}
