// First Principles module (Roots & Routes). Copy and structure follow the
// "First Principles Module" spec, Nov 2026. Scoring bands / thresholds are
// pilot proposals: tune from pilot data.

export const FP_PREFIX = "fp.";
export const fpId = (s: string) => `${FP_PREFIX}${s}`;

export type FpPart = "A" | "B" | "C" | "D";

export interface FpOption { id: string; label: string }
export interface FpGridRow {
  id: string;
  label: string;
  /** Per-row anchors for 1-5 scales (dials). */
  left?: string;
  right?: string;
  /** Omit for the shared option list. */
  options?: FpOption[];
}

export type FpStep =
  | { kind: "choice"; id: string; part: FpPart; category: string; prompt: string; hint?: string; multi?: boolean; /** Most options a multi-select accepts. */ max?: number; options: FpOption[] }
  | { kind: "text"; id: string; part: FpPart; category: string; prompt: string; hint?: string }
  | { kind: "grid"; id: string; part: FpPart; category: string; prompt: string; hint?: string;
      options: FpOption[]; anchors?: [string, string]; rows: FpGridRow[] };


const SCALE_1_5: FpOption[] = [1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: String(n) }));

// ---------------------------------------------------------------- Part A

export const REASONS: FpOption[] = [
  { id: "family", label: "My parents or family suggested it" },
  { id: "peers", label: "My friends or seniors are doing it" },
  { id: "money", label: "It pays well" },
  { id: "marks", label: "My marks or stream point there" },
  { id: "safety", label: "It seems safe and stable" },
  { id: "interest", label: "I enjoy this kind of work" },
  { id: "unthought", label: "I haven't really thought about it" },
];

export const WORKPLACES: FpOption[] = [
  { id: "large", label: "Large company" },
  { id: "startup", label: "Startup" },
  { id: "govt", label: "Government or public sector" },
  { id: "own", label: "My own business" },
  { id: "research", label: "Research or academic" },
  { id: "freelance", label: "Freelance or independent" },
  { id: "unsure", label: "Not sure" },
];

export const NEXT_STEPS: FpOption[] = [
  { id: "work", label: "Start working" },
  { id: "study", label: "Study further" },
  { id: "explore", label: "Take time to explore" },
  { id: "unsure", label: "Not sure" },
];

export const NEXT_REASONS: FpOption[] = [
  { id: "default", label: "Everyone around me is doing it" },
  { id: "requirement", label: "My target role needs a degree" },
  { id: "readiness", label: "I don't feel ready to work yet" },
  { id: "independence", label: "I want to earn and be independent" },
  { id: "family", label: "My family expects it" },
  { id: "exploration", label: "I want to try things first" },
];

export const REASON_PHRASE: Record<string, string> = {
  family: "your family suggested it", peers: "friends or seniors are doing it", money: "it pays well",
  marks: "your marks or stream point there", safety: "it seems safe and stable", interest: "you enjoy this kind of work",
  unthought: "you hadn't really thought about it yet",
  default: "everyone around you is doing it", requirement: "your target role needs a degree",
  readiness: "you don't feel ready to work yet", independence: "you want to earn and be independent",
  exploration: "you want to try things first",
};

/** Short label used in "Your current choice may rest mainly on {reason}". */
export const REASON_SHORT: Record<string, string> = {
  family: "family expectations", peers: "what peers are doing", money: "pay", marks: "your marks or stream",
  default: "what everyone around you is doing",
};

export const WORKPLACE_PHRASE: Record<string, string> = {
  large: "a large company", startup: "a startup", govt: "government or the public sector", own: "your own business",
  research: "research or academia", freelance: "freelance or independent work", unsure: "a workplace you hadn't pictured yet",
};

export const NEXT_PHRASE: Record<string, string> = {
  work: "start working", study: "study further", explore: "take time to explore", unsure: "work out your next step",
};

export const A7_ROWS: FpGridRow[] = [
  { id: "career", label: "Your career choice" },
  { id: "workplace", label: "Your workplace choice" },
  { id: "next", label: "Your next step (work or study)" },
];

// ---------------------------------------------------------------- Part B

export type Conclusion = "career" | "work" | "next";

export interface BStatement { n: number; text: string; group: Conclusion; check: string }

export const B_STATEMENTS: BStatement[] = [
  { n: 1, group: "career", text: "My marks decide which careers are open to me.", check: "Which routes actually need certain marks, and which do not?" },
  { n: 2, group: "career", text: "A good career is one with a well-known job title.", check: "Do I want the title, or the work behind it?" },
  { n: 3, group: "career", text: "It is too late for me to switch to a different field.", check: "What would switching really take, in time and skills?" },
  { n: 4, group: "career", text: "I should choose a career my family understands.", check: "Whose decision is this, and what do I need from them?" },
  { n: 5, group: "career", text: "Salary is the main thing that makes a career good.", check: "What else do I need from work to stay in it for years?" },
  { n: 6, group: "work", text: "A big company is the safest place to start.", check: "Safe in what way: income, learning or reputation?" },
  { n: 7, group: "work", text: "Startups are more exciting than other workplaces.", check: "Which parts of startup work do I actually enjoy?" },
  { n: 8, group: "work", text: "I will be happy anywhere if the pay is good.", check: "What drained me in past projects, jobs or classes?" },
  { n: 9, group: "work", text: "The workplace matters less than the job itself.", check: "Have I ever done good work in a setting I disliked?" },
  { n: 10, group: "next", text: "A higher degree always leads to a better job.", check: "Does my target route reward the degree, or experience?" },
  { n: 11, group: "next", text: "I should study further now, because it gets harder later.", check: "What would I gain or lose by working first?" },
  { n: 12, group: "next", text: "I need to be completely sure before I start working anywhere.", check: "What is the smallest step that would make me surer?" },
];

export const FLAG_AT = 4;
export const AGREE_ANCHORS: [string, string] = ["Strongly disagree", "Strongly agree"];

export const GROUP_LABEL: Record<Conclusion, string> = {
  career: "Your career route", work: "Your work environment", next: "Your next step",
};

// ---------------------------------------------------------------- Part C

export type Part = "tasks" | "problems" | "skills" | "people" | "reward";
export const PARTS: Part[] = ["tasks", "problems", "skills", "people", "reward"];

export const PART_OPTIONS: Record<Part, { prompt: string; options: FpOption[] }> = {
  tasks: {
    prompt: "What are you doing for most of the day?",
    options: [
      { id: "analyse", label: "Analysing numbers and information" },
      { id: "build", label: "Building or making things" },
      { id: "talk", label: "Talking, explaining and persuading" },
      { id: "organise", label: "Organising and running things" },
    ],
  },
  problems: {
    prompt: "What kind of problem are you solving?",
    options: [
      { id: "money", label: "How to grow or protect money" },
      { id: "systems", label: "How to make a system or process work better" },
      { id: "people", label: "What people need, feel or struggle with" },
      { id: "new", label: "What could exist that doesn't yet" },
    ],
  },
  skills: {
    prompt: "Which of your strengths are you using?",
    options: [
      { id: "logic", label: "Logic and numbers" },
      { id: "communication", label: "Communication and persuasion" },
      { id: "creative", label: "Creativity and design" },
      { id: "discipline", label: "Discipline and follow-through" },
    ],
  },
  people: {
    prompt: "Who benefits from your work?",
    options: [
      { id: "individuals", label: "Individuals I advise or serve" },
      { id: "company", label: "The company or team I'm part of" },
      { id: "public", label: "The public or a community" },
      { id: "users", label: "Users of something I build" },
    ],
  },
  reward: {
    prompt: "What makes the day feel worth it?",
    options: [
      { id: "money", label: "Solid pay and quick progress" },
      { id: "mastery", label: "Getting really good at something hard" },
      { id: "impact", label: "Seeing people's lives improve" },
      { id: "freedom", label: "Freedom and ownership" },
    ],
  },
};

export const PART_LABEL: Record<Part, string> = {
  tasks: "Tasks", problems: "Problems", skills: "Skills", people: "People", reward: "Reward",
};

/** Phrase for each chosen value, used inside "because ..." evidence. */
export const PART_PHRASE: Record<Part, Record<string, string>> = {
  tasks: { analyse: "analysing numbers and information", build: "building or making things", talk: "talking, explaining and persuading", organise: "organising and running things" },
  problems: { money: "growing or protecting money", systems: "making systems work better", people: "what people need and struggle with", new: "creating what doesn't exist yet" },
  skills: { logic: "logic and numbers", communication: "communication and persuasion", creative: "creativity and design", discipline: "discipline and follow-through" },
  people: { individuals: "individuals you advise or serve", company: "a company or team", public: "the public or a community", users: "users of what you build" },
  reward: { money: "solid pay and progress", mastery: "mastering something hard", impact: "improving people's lives", freedom: "freedom and ownership" },
};

export type Dial = "pace" | "structure" | "company" | "security" | "contact" | "size";
export const DIALS: Dial[] = ["pace", "structure", "company", "security", "contact", "size"];

export const DIAL_DEF: Record<Dial, { label: string; left: string; right: string; high: string; low: string }> = {
  pace: { label: "Pace", left: "Steady and predictable", right: "Fast and changing", high: "fast-paced", low: "steady-paced" },
  structure: { label: "Structure", left: "Clear rules and steps", right: "Freedom to decide how", high: "freedom-led", low: "structured" },
  company: { label: "Company", left: "Mostly working alone", right: "Mostly working with a team", high: "team-based", low: "independent" },
  security: { label: "Security", left: "Stable and certain", right: "Risky, with bigger upside", high: "high-upside", low: "stable" },
  contact: { label: "Contact", left: "Behind the scenes", right: "Facing clients or the public", high: "client-facing", low: "behind-the-scenes" },
  size: { label: "Size", left: "Small team where everyone knows you", right: "Large organisation with many layers", high: "large-organisation", low: "small-team" },
};

export type Focus = "people" | "data" | "things" | "ideas";
export const FOCUS_OPTIONS: FpOption[] = [
  { id: "people", label: "People" },
  { id: "data", label: "Data" },
  { id: "things", label: "Things" },
  { id: "ideas", label: "Ideas" },
];

export type Gap = "clarity" | "credential" | "experience" | "skill";
/** Clear the clarity gap first, then credential, then experience and skills (spec). */
export const GAP_PRIORITY: Gap[] = ["clarity", "credential", "experience", "skill"];

export const GAP_OPTIONS: { id: Gap; label: string }[] = [
  { id: "clarity", label: "I'm not fully sure this route is right for me yet" },
  { id: "credential", label: "It needs a qualification I don't have (by law or standard practice)" },
  { id: "skill", label: "It needs specific skills I haven't built yet" },
  { id: "experience", label: "Employers want hands-on experience I don't have yet" },
];

export const GAP_DEF: Record<Gap, { word: string; action: "work further" | "study further" | "explore first"; next: string }> = {
  clarity: { word: "clarity about the route", action: "explore first", next: "Intern, shadow or work first, then decide on study." },
  credential: { word: "a required qualification", action: "study further", next: "Study further: this route requires the qualification." },
  experience: { word: "hands-on experience", action: "work further", next: "Work first: employers here value hands-on work more than degrees." },
  skill: { word: "specific skills", action: "work further", next: "Short courses, projects or a training role; study further only if the skill is mainly taught in a degree." },
};

// ---------------------------------------------------------------- Steps

const A = (id: string) => fpId(`A${id}`);

export const PRE_STEPS: FpStep[] = [
  { kind: "text", id: A("1"), part: "A", category: "Your starting point", prompt: "Right now, which career or field are you leaning towards?", hint: "A job, a field, or just \"I have no idea yet\". Any answer is fine." },
  { kind: "choice", id: A("2"), part: "A", category: "Your starting point", prompt: "What is the main reason behind the career you are leaning towards?", options: REASONS },
  { kind: "choice", id: A("3"), part: "A", category: "Your starting point", prompt: "What kind of workplace do you picture yourself in?", options: WORKPLACES },
  { kind: "choice", id: A("4"), part: "A", category: "Your starting point", prompt: "Why that workplace?", options: REASONS },
  { kind: "choice", id: A("5"), part: "A", category: "Your starting point", prompt: "After your current course, what do you plan to do next?", options: NEXT_STEPS },
  { kind: "choice", id: A("6"), part: "A", category: "Your starting point", prompt: "Why that next step?", options: NEXT_REASONS },
  {
    kind: "grid", id: A("7"), part: "A", category: "Your starting point",
    prompt: "How sure are you about this answer?", hint: "1 is just a guess, 5 is very sure.",
    options: SCALE_1_5, anchors: ["Just a guess", "Very sure"],
    rows: A7_ROWS.map((r) => ({ ...r, id: fpId(`A7.${r.id}`) })),
  },
];

const group = (g: Conclusion): BStatement[] => B_STATEMENTS.filter((s) => s.group === g);
const bStep = (g: Conclusion): FpStep => ({
  kind: "grid", id: fpId(`B.${g}`), part: "B", category: "Check your assumptions",
  prompt: g === "career" ? "About your career route" : g === "work" ? "About your work environment" : "About your next step",
  hint: "How much do you agree? There are no wrong answers. We're only checking which beliefs are steering your choice.",
  options: SCALE_1_5, anchors: AGREE_ANCHORS,
  rows: group(g).map((s) => ({ id: fpId(`B${s.n}`), label: s.text })),
});

export const B_STEPS: FpStep[] = [bStep("career"), bStep("work"), bStep("next")];

export const C_STEPS_FIXED: FpStep[] = [
  {
    kind: "text", id: fpId("C1.day"), part: "C", category: "Break it down",
    prompt: "Describe a working day you would enjoy, without using any job title.",
    hint: "What would you be doing, and for whom?",
  },
  {
    kind: "grid", id: fpId("C1.parts"), part: "C", category: "Break it down",
    prompt: "Pick the one that fits that day best.", options: [],
    rows: PARTS.map((p) => ({ id: fpId(`C1.${p}`), label: PART_OPTIONS[p].prompt, options: PART_OPTIONS[p].options })),
  },
  {
    kind: "grid", id: fpId("C2.dials"), part: "C", category: "Break it down",
    prompt: "Place yourself on this dial.", hint: "1 is the left side, 5 is the right side.",
    options: SCALE_1_5,
    rows: DIALS.map((d) => ({ id: fpId(`C2.${d}`), label: DIAL_DEF[d].label, left: DIAL_DEF[d].left, right: DIAL_DEF[d].right })),
  },
  {
    kind: "choice", id: fpId("C2.focus"), part: "C", category: "Break it down", multi: true, max: 2,
    prompt: "Which do you most enjoy working with?", hint: "Pick up to two.", options: FOCUS_OPTIONS,
  },
  {
    kind: "choice", id: fpId("C3.gap"), part: "C", category: "Break it down", multi: true,
    prompt: "For the route you are leaning towards, what does it need that you don't have yet?",
    hint: "Pick every one that is true.", options: GAP_OPTIONS.map((g) => ({ id: g.id, label: g.label })),
  },
];

/** The three conclusions are written on the report's Thinking Page (spec Part D, Box 3), not in the test. */
export const CONCLUSION_IDS = [fpId("D.1"), fpId("D.2"), fpId("D.3")] as const;

export const POST_STEPS: FpStep[] = [...B_STEPS, ...C_STEPS_FIXED];
export const ALL_FP_STEPS: FpStep[] = [...PRE_STEPS, ...POST_STEPS];

export const NO_IDEA = /^\s*(i\s*)?(have\s*)?(no|not|don'?t|dont|idk|nothing|unsure|none)\b.*$/i;
