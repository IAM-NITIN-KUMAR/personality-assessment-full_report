import type { BItem, Degree, DomainId, OptionKey, RoleId, ScreenId } from "./types";

export interface ScreenDef {
  id: ScreenId;
  category: string;
  prompt: string;
  hint?: string;
  multi?: boolean;
  options: { key: OptionKey; label: string }[];
}

/** Q0 only ever produces answers a-e (its options list has 5 entries); "f" is not a valid Q0 key. */
export const DEGREE_BY_Q0: Record<Exclude<OptionKey, "f">, Degree> = {
  a: "engineering", b: "commerce", c: "science", d: "arts", e: "other",
};

export const B_SCENARIOS: Record<BItem, string> = {
  B1: "Sales are up 22%, profit is down 8%, and nobody knows why.",
  B2: "Two teammates have gone silent and the deadline is Friday.",
  B3: "A message that says exactly the right thing, and nobody reads it.",
  B4: "Rs 20,000 and 30 days to find out if an idea works.",
  B5: "The same mistake happens every month and everyone just works around it.",
  B6: "Someone capable is quietly falling behind and won't say why.",
};

export const B_REACTION_PROMPT = "Be honest about what just happened in your head.";
export const B_REACTION_OPTIONS: { key: OptionKey; label: string }[] = [
  { key: "a", label: "I started solving it before I finished reading" },
  { key: "b", label: "I want the answer, but I don't want to be the one figuring it out" },
  { key: "c", label: "Nothing much either way" },
  { key: "d", label: "I felt my energy drop" },
];

const bScreen = (id: BItem): ScreenDef => ({
  id,
  category: "React honestly",
  prompt: B_SCENARIOS[id],
  hint: B_REACTION_PROMPT,
  options: B_REACTION_OPTIONS,
});

export const C1_PROMPT = "Based on how you reacted, which of these worlds do you want to look inside?";

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
    prompt: "A packed day ends, and your floor is planning something loud tonight.",
    options: [
      { key: "a", label: "I'm in, that's how I recharge" },
      { key: "b", label: "Go for a bit, leave early" },
      { key: "c", label: "Skip it, I recharge alone" },
      { key: "d", label: "Only if I'm the one running it" },
    ],
  },
  A2: {
    id: "A2", category: "How you work",
    prompt: "Your best work this year happened:",
    options: [
      { key: "a", label: "Alone, headphones on" },
      { key: "b", label: "With one or two people" },
      { key: "c", label: "In a full team" },
      { key: "d", label: "While teaching or helping someone" },
    ],
  },
  A3: {
    id: "A3", category: "How you work",
    prompt: "Electives close tomorrow. You:",
    options: [
      { key: "a", label: "Compare options on a sheet" },
      { key: "b", label: "Go with gut" },
      { key: "c", label: "Ask seniors" },
      { key: "d", label: "Pick whatever opens the most doors" },
    ],
  },
  A4: {
    id: "A4", category: "How you work",
    prompt: "A great opportunity, but half the details are missing. You:",
    options: [
      { key: "a", label: "Wait for clarity before committing" },
      { key: "b", label: "Say yes, figure it out" },
      { key: "c", label: "Yes, if someone I trust is in" },
      { key: "d", label: "Research fast, then decide" },
    ],
  },
  A5: {
    id: "A5", category: "How you work",
    prompt: "Two internships. A: clear tasks, daily check-ins. B: “here's the goal, do it your way.”",
    options: [
      { key: "a", label: "Team A" },
      { key: "b", label: "Team B" },
      { key: "c", label: "Team B, with a mentor" },
      { key: "d", label: "Whichever team I click with" },
    ],
  },
  A6: {
    id: "A6", category: "How you work",
    prompt: "A project has no deadline. What actually happens?",
    options: [
      { key: "a", label: "I set my own milestones early" },
      { key: "b", label: "Plan first, then steady work" },
      { key: "c", label: "I start when a date appears" },
      { key: "d", label: "Best work only under pressure" },
    ],
  },
  A7: {
    id: "A7", category: "How you work",
    prompt: "If the right opportunity required you to move, you would:",
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
    prompt: "Protect one, the rest take a hit:",
    options: [
      { key: "a", label: "Meaning" }, { key: "b", label: "Mastery" }, { key: "c", label: "Freedom" },
      { key: "d", label: "Relationships" }, { key: "e", label: "Health" }, { key: "f", label: "Money" },
    ],
  },
  E2: {
    id: "E2", category: "Roots",
    prompt: "Losing which one makes even a dream job not worth it?",
    options: [
      { key: "a", label: "Meaning" }, { key: "b", label: "Mastery" }, { key: "c", label: "Freedom" },
      { key: "d", label: "Relationships" }, { key: "e", label: "Health" }, { key: "f", label: "Money" },
    ],
  },
  E3: {
    id: "E3", category: "Roots",
    prompt: "Career decisions in your family are actually:",
    options: [
      { key: "a", label: "I decide, then tell them" },
      { key: "b", label: "We decide together" },
      { key: "c", label: "Their approval matters to my call" },
      { key: "d", label: "I'd choose differently if it were only mine" },
    ],
  },
  F1: {
    id: "F1", category: "Reality & path",
    prompt: "Real exposure to your top field so far:",
    options: [
      { key: "a", label: "None" },
      { key: "b", label: "One project or internship" },
      { key: "c", label: "A few" },
      { key: "d", label: "Ongoing" },
    ],
  },
  F2: {
    id: "F2", category: "Reality & path",
    prompt: "Spoken to anyone actually doing the job?",
    options: [
      { key: "a", label: "No" },
      { key: "b", label: "Once" },
      { key: "c", label: "A few times" },
      { key: "d", label: "Regularly" },
    ],
  },
  F3: {
    id: "F3", category: "Reality & path",
    prompt: "After graduation:",
    options: [
      { key: "a", label: "Higher studies" },
      { key: "b", label: "Work" },
      { key: "c", label: "Undecided" },
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
      { id: "C2", prompt: "Four rooms, one morning. Pick yours.", options: [
        { key: "a", label: "The number nobody can explain", weights: { markets: 3, risk: 2 } },
        { key: "b", label: "The negotiation deciding the price", weights: { deals: 3, advisory: 1 } },
        { key: "c", label: "The review that catches the miss", weights: { risk: 3, markets: 1 } },
        { key: "d", label: "Someone deciding their money's future", weights: { advisory: 3, deals: 1 } },
      ]},
      { id: "C3", prompt: "Something fails at 9pm. Which stings most?", options: [
        { key: "a", label: "Right call, wrong size", weights: { markets: 3 } },
        { key: "b", label: "Deal closed, they won", weights: { deals: 3 } },
        { key: "c", label: "Your sign-off had a hole", weights: { risk: 3 } },
        { key: "d", label: "Client followed you and lost", weights: { advisory: 3 } },
      ]},
      { id: "C4", prompt: "You get to be definitely right about one thing:", options: [
        { key: "a", label: "Where the price goes", weights: { markets: 3 } },
        { key: "b", label: "What the business is worth", weights: { deals: 3 } },
        { key: "c", label: "What breaks, and how badly", weights: { risk: 3 } },
        { key: "d", label: "What this person should do next", weights: { advisory: 3 } },
      ]},
      { id: "C5", prompt: "Which would you least want said about your work?", options: [
        { key: "a", label: "“Safe, never called it early”", weights: { markets: 3 } },
        { key: "b", label: "“Good analyst, couldn't close”", weights: { deals: 3 } },
        { key: "c", label: "“Fast, missed things”", weights: { risk: 3 } },
        { key: "d", label: "“Smart, nobody trusted them”", weights: { advisory: 3 } },
      ]},
    ],
  },
  business: {
    roles: ["operations", "strategy", "growth", "people_hr"],
    screens: [
      { id: "C2", prompt: "Four meetings, one morning. Pick yours.", options: [
        { key: "a", label: "Why the same delay keeps happening", weights: { operations: 3 } },
        { key: "b", label: "Which of three markets to enter", weights: { strategy: 3 } },
        { key: "c", label: "Why people click but don't buy", weights: { growth: 3 } },
        { key: "d", label: "Why good people keep leaving", weights: { people_hr: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "It worked, but couldn't scale", weights: { operations: 3 } },
        { key: "b", label: "Right call, two years late", weights: { strategy: 3 } },
        { key: "c", label: "Good product, nobody heard of it", weights: { growth: 3 } },
        { key: "d", label: "Hit the numbers, lost the team", weights: { people_hr: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "How the work actually gets done", weights: { operations: 3, strategy: 1 } },
        { key: "b", label: "Where the industry is going", weights: { strategy: 3 } },
        { key: "c", label: "What makes someone choose us", weights: { growth: 3, strategy: 1 } },
        { key: "d", label: "Who to hire, who to let go", weights: { people_hr: 3 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Great ideas, nothing shipped”", weights: { operations: 3 } },
        { key: "b", label: "“Efficient, no bigger picture”", weights: { strategy: 3 } },
        { key: "c", label: "“Solid, nothing ever landed”", weights: { growth: 3 } },
        { key: "d", label: "“Delivered numbers, burned people”", weights: { people_hr: 3 } },
      ]},
    ],
  },
  entrepreneurship: {
    roles: ["founder", "product", "sales", "operator"],
    screens: [
      { id: "C2", prompt: "Your idea has one problem. Which would you rather have?", options: [
        { key: "a", label: "Nobody knows if anyone wants it", weights: { founder: 3 } },
        { key: "b", label: "People want it, it's confusing to use", weights: { product: 3 } },
        { key: "c", label: "It's good, nobody's heard of it", weights: { sales: 3 } },
        { key: "d", label: "It works, but breaks when it grows", weights: { operator: 3 } },
      ]},
      { id: "C3", prompt: "Which morning would you enjoy?", options: [
        { key: "a", label: "Ten stranger conversations to test the idea", weights: { founder: 3, sales: 1 } },
        { key: "b", label: "Watching five people use it, noting hesitations", weights: { product: 3 } },
        { key: "c", label: "Six no's, going back a seventh time", weights: { sales: 3 } },
        { key: "d", label: "Fixing last week's break so it never repeats", weights: { operator: 3 } },
      ]},
      { id: "C4", prompt: "You can only have one:", options: [
        { key: "a", label: "The nerve to start before it's ready", weights: { founder: 3 } },
        { key: "b", label: "The instinct for what to build next", weights: { product: 3, founder: 1 } },
        { key: "c", label: "Getting almost anyone to yes", weights: { sales: 3 } },
        { key: "d", label: "Making anything run without you", weights: { operator: 3 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Waited until it was safe”", weights: { founder: 3 } },
        { key: "b", label: "“Built what they liked, not what was needed”", weights: { product: 3 } },
        { key: "c", label: "“Great product, no customers”", weights: { sales: 3 } },
        { key: "d", label: "“Grew fast, fell over”", weights: { operator: 3 } },
      ]},
    ],
  },
  technology: {
    roles: ["build", "data", "product_tech", "infrastructure"],
    screens: [
      { id: "C2", prompt: "Pick your room.", options: [
        { key: "a", label: "The thing due Friday that doesn't exist yet", weights: { build: 3 } },
        { key: "b", label: "The number that changed and nobody knows why", weights: { data: 3 } },
        { key: "c", label: "The argument over what to build at all", weights: { product_tech: 3 } },
        { key: "d", label: "The alert that went off at 3am", weights: { infrastructure: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "It works, the code's a mess nobody can touch", weights: { build: 3 } },
        { key: "b", label: "Clean analysis, wrong conclusion", weights: { data: 3 } },
        { key: "c", label: "Built exactly what was asked, nobody used it", weights: { product_tech: 3 } },
        { key: "d", label: "Ran perfectly until the one day it didn't", weights: { infrastructure: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "How to make it work", weights: { build: 3 } },
        { key: "b", label: "What the data actually says", weights: { data: 3 } },
        { key: "c", label: "What's worth building", weights: { product_tech: 3, data: 1 } },
        { key: "d", label: "Where it breaks under load", weights: { infrastructure: 3, build: 1 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Clever code, took three times as long”", weights: { build: 3 } },
        { key: "b", label: "“Impressive chart, wrong question”", weights: { data: 3 } },
        { key: "c", label: "“Shipped a lot, none of it mattered”", weights: { product_tech: 3 } },
        { key: "d", label: "“Fast, and it went down twice”", weights: { infrastructure: 3 } },
      ]},
    ],
  },
  people_society: {
    roles: ["psychology", "education", "policy", "community"],
    screens: [
      { id: "C2", prompt: "Pick your room.", options: [
        { key: "a", label: "One person, one hour, something never said aloud", weights: { psychology: 3 } },
        { key: "b", label: "Thirty people who'll get it by the end", weights: { education: 3 } },
        { key: "c", label: "A badly written rule affecting a lakh people", weights: { policy: 3 } },
        { key: "d", label: "A service that exists, a community that won't use it", weights: { community: 3 } },
      ]},
      { id: "C3", prompt: "Which failure stings most?", options: [
        { key: "a", label: "They trusted you, you missed what was wrong", weights: { psychology: 3 } },
        { key: "b", label: "You explained well, they still couldn't do it", weights: { education: 3 } },
        { key: "c", label: "Right policy, never implemented", weights: { policy: 3 } },
        { key: "d", label: "The programme worked, the funding stopped", weights: { community: 3 } },
      ]},
      { id: "C4", prompt: "Definitely right about one thing:", options: [
        { key: "a", label: "What's really going on with this person", weights: { psychology: 3 } },
        { key: "b", label: "How someone learns best", weights: { education: 3, psychology: 1 } },
        { key: "c", label: "What the system should change", weights: { policy: 3 } },
        { key: "d", label: "What this community actually needs", weights: { community: 3, policy: 1 } },
      ]},
      { id: "C5", prompt: "Least want said:", options: [
        { key: "a", label: "“Kind, never went deep”", weights: { psychology: 3 } },
        { key: "b", label: "“Knew it, couldn't teach it”", weights: { education: 3 } },
        { key: "c", label: "“Good intentions, no evidence”", weights: { policy: 3 } },
        { key: "d", label: "“Great report, changed nothing”", weights: { community: 3 } },
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
    { key: "b" as const, label: "Yes, if it compounds" },
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
