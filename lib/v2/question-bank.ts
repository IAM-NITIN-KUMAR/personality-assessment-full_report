import type { BItem, Degree, DomainId, OptionKey, RoleId, ScreenId } from "./types";
import type { Discipline } from "../course-catalog";

export interface ScreenDef {
  id: ScreenId;
  category: string;
  prompt: string;
  hint?: string;
  multi?: boolean;
  options: { key: OptionKey; label: string }[];
}

/** "f" is defensively unreachable at runtime — Q0 only ever renders options a-e — but the
 * public contract is the full OptionKey domain so downstream indexing (`DEGREE_BY_Q0[key]`
 * with `key: OptionKey`) type-checks under strict mode. */
export const DEGREE_BY_Q0: Record<OptionKey, Degree> = {
  a: "engineering", b: "commerce", c: "science", d: "arts", e: "other", f: "other",
};

/** Registration already asks the field of study, so Q0 never renders: the flow seeds
 * answers.Q0 from the profile's discipline via this map. Q0 stays in the bank as a
 * fallback for profiles with no discipline. */
export const Q0_KEY_BY_DISCIPLINE: Record<Discipline, OptionKey> = {
  tech_cs: "a", tech_engg: "a",
  business: "b", commerce: "b", economics: "b",
  science: "c",
  psychology: "d", humanities: "d", media: "d", design_arch: "d",
  law: "e", education: "e", hospitality: "e", schooling: "e",
};

export const B_SCENARIOS: Record<BItem, string> = {
  B1: "Sales went up 22%, but profit went down 8% — and nobody in the room can explain why.",
  B2: "The deadline is Friday, and two of your teammates have suddenly stopped replying. The project is stuck.",
  B3: "You made something you're proud of — a post, a design, a pitch — and almost nobody saw it.",
  B4: "You have Rs 20,000 and 30 days to find out if a business idea actually works.",
  B5: "The same mistake happens every month, and everyone just works around it instead of fixing it.",
  B6: "A capable teammate is quietly falling behind, and won't tell anyone why.",
};

export const B_REACTION_PROMPT = "What's your honest first reaction?";
export const B_REACTION_OPTIONS: { key: OptionKey; label: string }[] = [
  { key: "a", label: "I was already thinking about what I'd try first" },
  { key: "b", label: "I'd be curious how it turns out, but I wouldn't want to do it myself" },
  { key: "c", label: "It wouldn't really pull me in either way" },
  { key: "d", label: "Honestly, just thinking about it drains me" },
];

const bScreen = (id: BItem): ScreenDef => ({
  id,
  category: "React honestly",
  prompt: B_SCENARIOS[id],
  hint: B_REACTION_PROMPT,
  options: B_REACTION_OPTIONS,
});

export const C1_PROMPT = "Based on how you reacted, which of these worlds would you like to look inside?";

/** One-line descriptors appended to the C1 domain cards so the choice means
 * something to a student who hasn't met these worlds yet. */
export const C1_BLURBS: Record<DomainId, string> = {
  finance: "markets, money, and what things are worth",
  business: "how companies run, grow, and win",
  entrepreneurship: "building something of your own from zero",
  technology: "building products and making sense of data",
  people_society: "understanding, teaching, and helping people",
};

export const STATIC_SCREENS: Record<
  Exclude<ScreenId, "C1" | "C2" | "C3" | "C4" | "C5" | "D1" | "D2" | "F4">,
  ScreenDef
> = {
  Q0: {
    id: "Q0", category: "About you",
    prompt: "What are you studying right now?",
    options: [
      { key: "a", label: "Engineering / Technology" },
      { key: "b", label: "Commerce / Business" },
      { key: "c", label: "Science" },
      { key: "d", label: "Arts / Humanities / Design" },
      { key: "e", label: "Other" },
    ],
  },
  A1: {
    id: "A1", category: "How you work",
    prompt: "After a packed day, your hostel floor is planning something loud tonight. What do you do?",
    options: [
      { key: "a", label: "I'm in — that's how I recharge" },
      { key: "b", label: "Go for a bit, leave early" },
      { key: "c", label: "Skip it — I recharge alone" },
      { key: "d", label: "Only if I'm the one running it" },
    ],
  },
  A2: {
    id: "A2", category: "How you work",
    prompt: "Where did your best work this year actually happen?",
    options: [
      { key: "a", label: "Alone, headphones on" },
      { key: "b", label: "With one or two people" },
      { key: "c", label: "In a full team" },
      { key: "d", label: "While teaching or helping someone" },
    ],
  },
  A3: {
    id: "A3", category: "How you work",
    prompt: "Elective choices close tomorrow and you still haven't picked. What do you do?",
    options: [
      { key: "a", label: "Compare the options on a sheet" },
      { key: "b", label: "Go with my gut" },
      { key: "c", label: "Ask seniors what they'd pick" },
      { key: "d", label: "Pick whatever opens the most doors" },
    ],
  },
  A4: {
    id: "A4", category: "How you work",
    prompt: "A great opportunity comes up, but half the details are missing. What do you do?",
    options: [
      { key: "a", label: "Wait for clarity before committing" },
      { key: "b", label: "Say yes and figure it out" },
      { key: "c", label: "Say yes if someone I trust is in" },
      { key: "d", label: "Research fast, then decide" },
    ],
  },
  A5: {
    id: "A5", category: "How you work",
    prompt: "Two internship offers. Team A: clear tasks, daily check-ins. Team B: “here's the goal, do it your way.” Which one do you take?",
    options: [
      { key: "a", label: "Team A" },
      { key: "b", label: "Team B" },
      { key: "c", label: "Team B, but with a mentor" },
      { key: "d", label: "Whichever team I click with" },
    ],
  },
  A6: {
    id: "A6", category: "How you work",
    prompt: "A project has no deadline. What actually happens?",
    options: [
      { key: "a", label: "I set my own milestones early" },
      { key: "b", label: "I plan first, then work steadily" },
      { key: "c", label: "I start when a date appears" },
      { key: "d", label: "My best work only happens under pressure" },
    ],
  },
  A7: {
    id: "A7", category: "How you work",
    prompt: "If the right opportunity required you to move city, what would you do?",
    options: [
      { key: "a", label: "Relocate anywhere in the world for it" },
      { key: "b", label: "Relocate anywhere within India" },
      { key: "c", label: "Move only for an exceptional offer" },
      { key: "d", label: "Rather find something where I already live" },
    ],
  },
  B1: bScreen("B1"), B2: bScreen("B2"), B3: bScreen("B3"),
  B4: bScreen("B4"), B5: bScreen("B5"), B6: bScreen("B6"),
  E1: {
    id: "E1", category: "Roots",
    prompt: "If you could fully protect only one of these in your career, which would it be?",
    hint: "The others will take a hit sometimes — that's the trade.",
    options: [
      { key: "a", label: "Meaning — work that actually matters to me" },
      { key: "b", label: "Mastery — getting genuinely good at something" },
      { key: "c", label: "Freedom — control over my time and choices" },
      { key: "d", label: "Relationships — time for the people I care about" },
      { key: "e", label: "Health — energy and peace of mind" },
      { key: "f", label: "Money — comfort and security" },
    ],
  },
  E2: {
    id: "E2", category: "Roots",
    prompt: "Losing which of these would make even a dream job not worth it?",
    options: [
      { key: "a", label: "Meaning — work that actually matters to me" },
      { key: "b", label: "Mastery — getting genuinely good at something" },
      { key: "c", label: "Freedom — control over my time and choices" },
      { key: "d", label: "Relationships — time for the people I care about" },
      { key: "e", label: "Health — energy and peace of mind" },
      { key: "f", label: "Money — comfort and security" },
    ],
  },
  E3: {
    id: "E3", category: "Roots",
    prompt: "How do career decisions actually happen in your family?",
    options: [
      { key: "a", label: "I decide, then tell them" },
      { key: "b", label: "We decide together" },
      { key: "c", label: "Their approval matters to my call" },
      { key: "d", label: "I'd choose differently if it were only up to me" },
    ],
  },
  F1: {
    id: "F1", category: "Reality & path",
    prompt: "How much real exposure have you had to the field you're leaning toward?",
    options: [
      { key: "a", label: "None yet" },
      { key: "b", label: "One project or internship" },
      { key: "c", label: "A few projects or internships" },
      { key: "d", label: "Ongoing — it's already part of my life" },
    ],
  },
  F2: {
    id: "F2", category: "Reality & path",
    prompt: "Have you ever spoken to someone who actually does this job for a living?",
    options: [
      { key: "a", label: "No, not yet" },
      { key: "b", label: "Once" },
      { key: "c", label: "A few times" },
      { key: "d", label: "Yes, regularly" },
    ],
  },
  F3: {
    id: "F3", category: "Reality & path",
    prompt: "What's your plan after graduation?",
    options: [
      { key: "a", label: "Higher studies" },
      { key: "b", label: "Start working" },
      { key: "c", label: "Still undecided" },
    ],
  },
  F5a: {
    id: "F5a", category: "Reality & path", multi: true,
    prompt: "Which countries are you considering?",
    options: [
      { key: "a", label: "USA" }, { key: "b", label: "UK" }, { key: "c", label: "Canada" },
      { key: "d", label: "Australia" }, { key: "e", label: "Germany" }, { key: "f", label: "Other / not decided" },
    ],
  },
  F5b: {
    id: "F5b", category: "Reality & path",
    prompt: "When would you want to start?",
    options: [
      { key: "a", label: "Within 12 months" }, { key: "b", label: "1 to 2 years" },
      { key: "c", label: "2 to 3 years" }, { key: "d", label: "No fixed timeline" },
    ],
  },
  F5c: {
    id: "F5c", category: "Reality & path",
    prompt: "How would it be funded?",
    options: [
      { key: "a", label: "Family funded" }, { key: "b", label: "Loan plus family" },
      { key: "c", label: "Scholarship dependent" }, { key: "d", label: "Not planned yet" },
    ],
  },
};

export function F4_PROMPT(a7: OptionKey): string {
  const quote = a7 === "a"
    ? "You said you would move anywhere in the world for the right opportunity."
    : "You said you would move for an exceptional opportunity.";
  return `${quote} Would that include studying abroad?`;
}

export const F4_OPTIONS: { key: OptionKey; label: string }[] = [
  { key: "a", label: "Definitely" },
  { key: "b", label: "Open to it" },
  { key: "c", label: "I'd rather study in India" },
];

interface CScreenDef {
  id: "C2" | "C3" | "C4" | "C5";
  prompt: string;
  options: { key: OptionKey; label: string; weights: Partial<Record<RoleId, number>> }[];
}

export const C_BRANCHES: Record<DomainId, { roles: RoleId[]; screens: CScreenDef[] }> = {
  finance: {
    roles: ["markets", "deals", "risk", "advisory"],
    screens: [
      { id: "C2", prompt: "Monday morning at a finance firm. Which of these would you rather be doing?", options: [
        { key: "a", label: "Figuring out the number nobody can explain", weights: { markets: 3, risk: 2 } },
        { key: "b", label: "Running the negotiation that decides the price", weights: { deals: 3, advisory: 1 } },
        { key: "c", label: "Doing the review that catches the mistake everyone missed", weights: { risk: 3, markets: 1 } },
        { key: "d", label: "Helping someone decide what to do with their money", weights: { advisory: 3, deals: 1 } },
      ]},
      { id: "C3", prompt: "Something goes wrong at 9pm. Which failure would sting the most?", options: [
        { key: "a", label: "You made the right call, but sized it wrong", weights: { markets: 3 } },
        { key: "b", label: "The deal closed, but the other side won", weights: { deals: 3 } },
        { key: "c", label: "The report you signed off had a hole in it", weights: { risk: 3 } },
        { key: "d", label: "A client followed your advice and lost money", weights: { advisory: 3 } },
      ]},
      { id: "C4", prompt: "If you could always be right about one thing, which would you pick?", options: [
        { key: "a", label: "Where the price is going", weights: { markets: 3 } },
        { key: "b", label: "What a business is really worth", weights: { deals: 3 } },
        { key: "c", label: "What could break, and how badly", weights: { risk: 3 } },
        { key: "d", label: "What this person should do next with their money", weights: { advisory: 3 } },
      ]},
      { id: "C5", prompt: "Which comment about your work would sting the most?", options: [
        { key: "a", label: "“Safe, but never called it early”", weights: { markets: 3 } },
        { key: "b", label: "“Good analyst, but couldn't close”", weights: { deals: 3 } },
        { key: "c", label: "“Fast, but missed things”", weights: { risk: 3 } },
        { key: "d", label: "“Smart, but nobody trusted them”", weights: { advisory: 3 } },
      ]},
    ],
  },
  business: {
    roles: ["operations", "strategy", "growth", "people_hr"],
    screens: [
      { id: "C2", prompt: "Monday morning at a company. Which of these would you rather be doing?", options: [
        { key: "a", label: "Working out why the same delay keeps happening", weights: { operations: 3 } },
        { key: "b", label: "Deciding which of three markets to enter", weights: { strategy: 3 } },
        { key: "c", label: "Figuring out why people click but don't buy", weights: { growth: 3 } },
        { key: "d", label: "Understanding why good people keep leaving", weights: { people_hr: 3 } },
      ]},
      { id: "C3", prompt: "Which failure would sting the most?", options: [
        { key: "a", label: "It worked, but it couldn't scale", weights: { operations: 3 } },
        { key: "b", label: "You made the right call — two years too late", weights: { strategy: 3 } },
        { key: "c", label: "A good product that nobody ever heard of", weights: { growth: 3 } },
        { key: "d", label: "You hit the numbers, but lost the team", weights: { people_hr: 3 } },
      ]},
      { id: "C4", prompt: "If you could always be right about one thing, which would you pick?", options: [
        { key: "a", label: "How the work actually gets done", weights: { operations: 3, strategy: 1 } },
        { key: "b", label: "Where the industry is going", weights: { strategy: 3 } },
        { key: "c", label: "What makes someone choose us", weights: { growth: 3, strategy: 1 } },
        { key: "d", label: "Who to hire, and who to let go", weights: { people_hr: 3 } },
      ]},
      { id: "C5", prompt: "Which comment about your work would sting the most?", options: [
        { key: "a", label: "“Great ideas, but nothing shipped”", weights: { operations: 3 } },
        { key: "b", label: "“Efficient, but no bigger picture”", weights: { strategy: 3 } },
        { key: "c", label: "“Solid work, but nothing ever landed”", weights: { growth: 3 } },
        { key: "d", label: "“Delivered the numbers, but burned out the people”", weights: { people_hr: 3 } },
      ]},
    ],
  },
  entrepreneurship: {
    roles: ["founder", "product", "sales", "operator"],
    screens: [
      { id: "C2", prompt: "Every idea comes with one big problem. Which would you rather deal with?", options: [
        { key: "a", label: "Nobody knows if anyone wants it yet", weights: { founder: 3 } },
        { key: "b", label: "People want it, but it's confusing to use", weights: { product: 3 } },
        { key: "c", label: "It's good, but nobody has heard of it", weights: { sales: 3 } },
        { key: "d", label: "It works, but it breaks when it grows", weights: { operator: 3 } },
      ]},
      { id: "C3", prompt: "Which of these mornings would you actually enjoy?", options: [
        { key: "a", label: "Talking to ten strangers to test the idea", weights: { founder: 3, sales: 1 } },
        { key: "b", label: "Watching five people use it, noting where they hesitate", weights: { product: 3 } },
        { key: "c", label: "Hearing six no's, and going back a seventh time", weights: { sales: 3 } },
        { key: "d", label: "Fixing last week's breakdown so it never happens again", weights: { operator: 3 } },
      ]},
      { id: "C4", prompt: "If you could only have one of these strengths, which would you pick?", options: [
        { key: "a", label: "The nerve to start before it's ready", weights: { founder: 3 } },
        { key: "b", label: "The instinct for what to build next", weights: { product: 3, founder: 1 } },
        { key: "c", label: "The knack for getting almost anyone to yes", weights: { sales: 3 } },
        { key: "d", label: "The ability to make anything run without you", weights: { operator: 3 } },
      ]},
      { id: "C5", prompt: "Which comment about your work would sting the most?", options: [
        { key: "a", label: "“Waited until it was safe”", weights: { founder: 3 } },
        { key: "b", label: "“Built what they liked, not what was needed”", weights: { product: 3 } },
        { key: "c", label: "“Great product, but no customers”", weights: { sales: 3 } },
        { key: "d", label: "“Grew fast, then fell over”", weights: { operator: 3 } },
      ]},
    ],
  },
  technology: {
    roles: ["build", "data", "product_tech", "infrastructure"],
    screens: [
      { id: "C2", prompt: "Monday morning on a tech team. Which of these would you rather be doing?", options: [
        { key: "a", label: "Building the thing due Friday that doesn't exist yet", weights: { build: 3 } },
        { key: "b", label: "Finding out why the number changed overnight", weights: { data: 3 } },
        { key: "c", label: "Settling the argument over what to build at all", weights: { product_tech: 3 } },
        { key: "d", label: "Chasing the alert that went off at 3am", weights: { infrastructure: 3 } },
      ]},
      { id: "C3", prompt: "Which failure would sting the most?", options: [
        { key: "a", label: "It works, but the code is a mess nobody can touch", weights: { build: 3 } },
        { key: "b", label: "A clean analysis that reached the wrong conclusion", weights: { data: 3 } },
        { key: "c", label: "You built exactly what was asked, and nobody used it", weights: { product_tech: 3 } },
        { key: "d", label: "It ran perfectly until the one day it didn't", weights: { infrastructure: 3 } },
      ]},
      { id: "C4", prompt: "If you could always be right about one thing, which would you pick?", options: [
        { key: "a", label: "How to make it work", weights: { build: 3 } },
        { key: "b", label: "What the data actually says", weights: { data: 3 } },
        { key: "c", label: "What's worth building", weights: { product_tech: 3, data: 1 } },
        { key: "d", label: "Where it breaks under load", weights: { infrastructure: 3, build: 1 } },
      ]},
      { id: "C5", prompt: "Which comment about your work would sting the most?", options: [
        { key: "a", label: "“Clever code, but it took three times as long”", weights: { build: 3 } },
        { key: "b", label: "“Impressive chart, but wrong question”", weights: { data: 3 } },
        { key: "c", label: "“Shipped a lot, but none of it mattered”", weights: { product_tech: 3 } },
        { key: "d", label: "“Fast, but it went down twice”", weights: { infrastructure: 3 } },
      ]},
    ],
  },
  people_society: {
    roles: ["psychology", "education", "policy", "community"],
    screens: [
      { id: "C2", prompt: "Four situations need someone this morning — which one do you step into?", options: [
        { key: "a", label: "One person, one hour, and something they've never said aloud", weights: { psychology: 3 } },
        { key: "b", label: "A class of thirty who'll get it by the end", weights: { education: 3 } },
        { key: "c", label: "A badly written rule that affects a lakh people", weights: { policy: 3 } },
        { key: "d", label: "A service that exists, and a community that won't use it", weights: { community: 3 } },
      ]},
      { id: "C3", prompt: "Which failure would sting the most?", options: [
        { key: "a", label: "They trusted you, and you missed what was wrong", weights: { psychology: 3 } },
        { key: "b", label: "You explained it well, and they still couldn't do it", weights: { education: 3 } },
        { key: "c", label: "The right policy that never got implemented", weights: { policy: 3 } },
        { key: "d", label: "The programme worked, and then the funding stopped", weights: { community: 3 } },
      ]},
      { id: "C4", prompt: "If you could always be right about one thing, which would you pick?", options: [
        { key: "a", label: "What's really going on with this person", weights: { psychology: 3 } },
        { key: "b", label: "How someone learns best", weights: { education: 3, psychology: 1 } },
        { key: "c", label: "What the system should change", weights: { policy: 3 } },
        { key: "d", label: "What this community actually needs", weights: { community: 3, policy: 1 } },
      ]},
      { id: "C5", prompt: "Which comment about your work would sting the most?", options: [
        { key: "a", label: "“Kind, but never went deep”", weights: { psychology: 3 } },
        { key: "b", label: "“Knew the subject, but couldn't teach it”", weights: { education: 3 } },
        { key: "c", label: "“Good intentions, but no evidence”", weights: { policy: 3 } },
        { key: "d", label: "“Great report, but nothing changed”", weights: { community: 3 } },
      ]},
    ],
  },
};

export const D_OPTIONS = {
  d1: [
    { key: "a" as const, label: "I'd take that over the alternative" },
    { key: "b" as const, label: "Livable, once I see why" },
    { key: "c" as const, label: "Hard, but I'd build the tolerance" },
    { key: "d" as const, label: "I'd resent it" },
  ],
  d2: [
    { key: "a" as const, label: "Yes, gladly" },
    { key: "b" as const, label: "Yes, if it's clearly building toward something" },
    { key: "c" as const, label: "I'd try" },
    { key: "d" as const, label: "No" },
  ],
};

export const D_STATEMENTS: Record<RoleId, { cost: string; grind: string }> = {
  markets: {
    cost: "Being wrong in public, with a number attached, monthly",
    grind: "Five years reading dry material to spot the one line that matters",
  },
  deals: {
    cost: "Weeks of 80% waiting, 20% panic at 11pm",
    grind: "Five years building models seniors present",
  },
  risk: {
    cost: "Being the person who slows things down, and unpopular for it",
    grind: "Five years of rules that change yearly, right in ways nobody thanks you for",
  },
  advisory: {
    cost: "Sitting with someone's money fear, promising nothing",
    grind: "Five years of trust built one person at a time",
  },
  operations: {
    cost: "Fix it well and nobody notices it was broken",
    grind: "Five years of small improvements that only compound if you stay",
  },
  strategy: {
    cost: "Months of work someone else decides on",
    grind: "Five years of being new to every industry",
  },
  growth: {
    cost: "Most experiments fail, measurably",
    grind: "Five years of public failures judged on the last number",
  },
  people_hr: {
    cost: "Holding secrets you cannot repeat",
    grind: "Five years of results that show up as things that did not happen",
  },
  founder: {
    cost: "Long stretches where nobody knows if it's working",
    grind: "Five years of income and status dipping in front of batchmates",
  },
  product: {
    cost: "Responsible for outcomes, authority over nothing",
    grind: "Five years of watching people misuse what you built",
  },
  sales: {
    cost: "Rejection as a daily, counted fact",
    grind: "Five years starting every month at zero",
  },
  operator: {
    cost: "Cleaning up decisions you did not make",
    grind: "Five years of being essential and invisible",
  },
  build: {
    cost: "Beginner again every eighteen months",
    grind: "Five years of bugs that turn out to be one character",
  },
  data: {
    cost: "Mostly cleaning, rarely the insight",
    grind: "Five years of saying “the data cannot tell us that”",
  },
  product_tech: {
    cost: "Saying no to people you like, repeatedly",
    grind: "Five years of shipped things getting killed",
  },
  infrastructure: {
    cost: "Visible only when something breaks",
    grind: "Five years of preventing problems nobody knows about",
  },
  psychology: {
    cost: "Carrying distress you cannot discuss at dinner",
    grind: "Five to seven years of training before independent practice",
  },
  education: {
    cost: "The same explanation, hundredth time, like the first",
    grind: "Five years of rarely knowing if it made a difference",
  },
  policy: {
    cost: "Watching evidence lose to politics",
    grind: "Five years for one change to move, if it moves",
  },
  community: {
    cost: "Less money and fewer people than the problem needs",
    grind: "Five years of programmes ending when funding ends",
  },
};
