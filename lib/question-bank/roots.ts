import type { Question } from "../types";

/**
 * Roots anchor bank — fixed, dimension-mapped scenarios. Every student answers
 * these so we have a comparable psychometric base. Adaptive probes branch off
 * these via /api/probe.
 *
 * Score convention: each option contributes to one or more dimensions on a
 * -2..+2 axis. Positive pushes toward the dimension's "high" pole (see
 * DIMENSION_LABELS in types.ts).
 */
export const ROOTS_ANCHORS: Question[] = [
  {
    id: "rt_decision_groupproj",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Decision style",
    dimension: "decision_style",
    prompt:
      "It's 11 PM. Your group project is due tomorrow morning, and the doc is a mess. What's your move?",
    options: [
      {
        id: "a",
        label: "Open a new doc, restructure the whole thing, message the group at 6 AM with a clean version.",
        scores: { decision_style: 2, drive: 2, structure: 1 },
      },
      {
        id: "b",
        label: "Send a voice note saying \"chill, we'll fix it tomorrow\" — and mostly mean it.",
        scores: { decision_style: -1, structure: -2, social: 1 },
      },
      {
        id: "c",
        label: "Start fixing the section I wrote. The rest is not my problem.",
        scores: { decision_style: 1, social: -2, drive: 0 },
      },
      {
        id: "d",
        label: "Call the most chaotic person in the group. Misery loves company.",
        scores: { decision_style: -2, social: 2, energy: 1 },
      },
    ],
  },
  {
    id: "rt_energy_saturday",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Energy & people",
    dimension: "energy",
    prompt: "After a long week, your idea of a perfect Saturday is:",
    options: [
      {
        id: "a",
        label: "A tiny, loud rooftop party where I know exactly three people.",
        scores: { energy: 2, social: 1, risk: 1 },
      },
      {
        id: "b",
        label: "Brunch with one friend who actually gets it. Then a long nap.",
        scores: { energy: 0, social: 1 },
      },
      {
        id: "c",
        label: "Alone, headphones on, deep in something I'm building or watching.",
        scores: { energy: -2, social: -2, drive: 1 },
      },
      {
        id: "d",
        label: "Honestly? Whatever the group chat decides. I'm down.",
        scores: { energy: 1, social: 2, decision_style: -1 },
      },
    ],
  },
  {
    id: "rt_structure_planning",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Structure",
    dimension: "structure",
    prompt:
      "You're planning a trip with friends in three weeks. By Tuesday, you have:",
    options: [
      {
        id: "a",
        label: "A spreadsheet. Tabs for budget, transport, day-by-day. It's beautiful.",
        scores: { structure: 2, decision_style: 1, drive: 1 },
      },
      {
        id: "b",
        label: "A vague plan. Flights booked, the rest is vibes.",
        scores: { structure: 0, risk: 1 },
      },
      {
        id: "c",
        label: "Nothing. We'll figure it out the night before. We always do.",
        scores: { structure: -2, risk: 2, decision_style: -1 },
      },
      {
        id: "d",
        label: "I'm waiting for someone else to start the spreadsheet.",
        scores: { structure: -1, drive: -2, social: 1 },
      },
    ],
  },
  {
    id: "rt_risk_opportunity",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Risk",
    dimension: "risk",
    prompt:
      "A senior offers you a spot on their startup project. Unpaid, unproven, sounds wild. You have midterms in 4 weeks.",
    options: [
      {
        id: "a",
        label: "In. I'll figure out midterms somehow — this won't come around again.",
        scores: { risk: 2, drive: 2, decision_style: -1 },
      },
      {
        id: "b",
        label: "Yes, but I'm setting hard hours so it doesn't tank my grades.",
        scores: { risk: 1, structure: 2, drive: 1 },
      },
      {
        id: "c",
        label: "Pass. Cool idea, wrong timing. Maybe summer.",
        scores: { risk: -1, structure: 1, decision_style: 1 },
      },
      {
        id: "d",
        label: "Hard no. I came to college to do well in college.",
        scores: { risk: -2, structure: 1 },
      },
    ],
  },
  {
    id: "rt_drive_boredom",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Drive",
    dimension: "drive",
    prompt: "You've got a free Sunday afternoon and zero plans. Most likely?",
    options: [
      {
        id: "a",
        label: "I open the laptop and start something — a project, a deck, a side hustle.",
        scores: { drive: 2, structure: 1 },
      },
      {
        id: "b",
        label: "I message someone. Whatever they're doing, I'm now doing.",
        scores: { drive: 0, social: 2, energy: 1 },
      },
      {
        id: "c",
        label: "I disappear into a YouTube rabbit hole and lose 4 hours, no regrets.",
        scores: { drive: -1, energy: -1 },
      },
      {
        id: "d",
        label: "I sleep. Aggressively.",
        scores: { drive: -2, energy: -1 },
      },
    ],
  },
  {
    id: "rt_social_conflict",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Social mode",
    dimension: "social",
    prompt:
      "Your closest friend is making a decision you think is genuinely bad. They haven't asked your opinion.",
    options: [
      {
        id: "a",
        label: "I tell them anyway. Gently. Friendship > comfort.",
        scores: { social: 1, decision_style: 1, risk: 1 },
      },
      {
        id: "b",
        label: "I drop hints. If they ask, I'll go all in.",
        scores: { social: 0, decision_style: -1 },
      },
      {
        id: "c",
        label: "Not my call. They'll figure it out themselves.",
        scores: { social: -2, decision_style: 1 },
      },
      {
        id: "d",
        label: "I'd ask three other friends what they think first. Group call.",
        scores: { social: 2, decision_style: -2 },
      },
    ],
  },
  {
    id: "rt_decision_choices",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Decision style",
    dimension: "decision_style",
    prompt: "You're at a restaurant with a giant menu. How do you order?",
    options: [
      {
        id: "a",
        label: "I read every section, eliminate, narrow down, commit. 4 minutes flat.",
        scores: { decision_style: 2, structure: 1 },
      },
      {
        id: "b",
        label: "I ask the waiter what's good and just go with it.",
        scores: { decision_style: -1, social: 1, risk: 1 },
      },
      {
        id: "c",
        label: "I always order the same thing. I know what I like.",
        scores: { decision_style: 1, structure: 2, risk: -2 },
      },
      {
        id: "d",
        label: "Whatever the table is getting. Fork-tax everyone's plate.",
        scores: { decision_style: -2, social: 2 },
      },
    ],
  },
  {
    id: "rt_energy_bigevent",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Energy",
    dimension: "energy",
    prompt:
      "You walk into a room of 60 people you've never met. There's a mic and an open floor.",
    options: [
      {
        id: "a",
        label: "I'd grab the mic. I'll think of what to say while I walk up.",
        scores: { energy: 2, risk: 2, decision_style: -1 },
      },
      {
        id: "b",
        label: "I'd find one interesting-looking person and talk to them all night.",
        scores: { energy: 0, social: 1 },
      },
      {
        id: "c",
        label: "I'd hover near the food, polite smile, leave by 9.",
        scores: { energy: -2, risk: -1 },
      },
      {
        id: "d",
        label: "I'd be early. I'd already know half the room by the time it filled up.",
        scores: { energy: 1, drive: 2, structure: 1 },
      },
    ],
  },
  {
    id: "rt_drive_feedback",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Drive",
    dimension: "drive",
    prompt:
      "You get back a piece of work with brutal feedback. Honest but painful. Your first 24 hours look like:",
    options: [
      {
        id: "a",
        label: "Sulk for an hour. Then re-read it cold and start fixing the real points.",
        scores: { drive: 2, decision_style: 1 },
      },
      {
        id: "b",
        label: "Defend it in my head for two days before I can look at it again.",
        scores: { drive: -1, risk: -1 },
      },
      {
        id: "c",
        label: "Send it to a friend and get a second opinion before I act on anything.",
        scores: { drive: 0, social: 1, decision_style: -1 },
      },
      {
        id: "d",
        label: "Throw the whole thing out. Restart from zero. Spite is fuel.",
        scores: { drive: 1, risk: 2, structure: -1 },
      },
    ],
  },
  {
    id: "rt_structure_morning",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Structure",
    dimension: "structure",
    prompt: "Your weekday mornings look like:",
    options: [
      {
        id: "a",
        label: "Same wake-up, same coffee, same playlist. The routine is the point.",
        scores: { structure: 2, drive: 1 },
      },
      {
        id: "b",
        label: "I have a routine in theory. In practice, I snooze 5 times.",
        scores: { structure: -1, drive: -1 },
      },
      {
        id: "c",
        label: "Different every day. I like the surprise.",
        scores: { structure: -2, risk: 1 },
      },
      {
        id: "d",
        label: "I don't really have mornings. I have late starts.",
        scores: { structure: -1, energy: -1 },
      },
    ],
  },
  // ── New finer-grained anchors (post-PRISM expansion) ────────────────────
  {
    id: "rt_detail_proofreading",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Detail",
    dimension: "structure",
    prompt:
      "Your friend asks you to proofread their statement of purpose for a top program. It's solid but you spot a typo, a wonky sentence, and a stat that feels wrong. They want it back in an hour.",
    options: [
      {
        id: "a",
        label: "Full pass — typo, sentence, stat, plus three more I find. Track changes, comments, the works.",
        scores: { structure: 2, decision_style: 2, drive: 1 },
      },
      {
        id: "b",
        label: "Fix the obvious typo and the sentence. Flag the stat with a question. Move on.",
        scores: { structure: 1, decision_style: 1 },
      },
      {
        id: "c",
        label: "Read once for vibe, not detail. Tell them it's good. The big stuff matters more than the polish.",
        scores: { structure: -1, decision_style: -1, social: 1 },
      },
      {
        id: "d",
        label: "Honestly, I'd skim it and say 'looks great' just to not delay them.",
        scores: { structure: -2, social: 1, drive: -1 },
      },
    ],
  },
  {
    id: "rt_compliance_rule",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Rules",
    dimension: "structure",
    prompt:
      "Your hostel has a rule: no guests after 10 PM. Your friend gets stranded at midnight needing a place to crash. The warden's asleep.",
    options: [
      {
        id: "a",
        label: "Sneak them in. Worst case I argue it later. They needed help.",
        scores: { structure: -2, risk: 2, social: 1 },
      },
      {
        id: "b",
        label: "Wake the warden, explain, ask for a one-time exception.",
        scores: { structure: 1, decision_style: 1, social: 1 },
      },
      {
        id: "c",
        label: "Find them an alternative — book a budget hotel, call a Uber, anything that doesn't break the rule.",
        scores: { structure: 2, decision_style: 1, risk: -1 },
      },
      {
        id: "d",
        label: "Tell them sorry, can't help. The rule's the rule.",
        scores: { structure: 2, risk: -2, social: -2 },
      },
    ],
  },
  {
    id: "rt_empathy_roommate",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Empathy",
    dimension: "social",
    prompt:
      "Your roommate has been off all week — short answers, eating alone, not their usual self. They haven't said anything's wrong.",
    options: [
      {
        id: "a",
        label: "Sit down, say I noticed, ask if they want to talk. No pressure.",
        scores: { social: 2, energy: 0, drive: 1 },
      },
      {
        id: "b",
        label: "Drop something thoughtful — their favorite snack, a meme, an invite to chai. Open a door, don't push.",
        scores: { social: 1, energy: 1 },
      },
      {
        id: "c",
        label: "Give them space. If they want to talk, they'll bring it up.",
        scores: { social: -1, energy: -1, decision_style: 0 },
      },
      {
        id: "d",
        label: "Honestly, I probably wouldn't have noticed.",
        scores: { social: -2, energy: -1 },
      },
    ],
  },
  {
    id: "rt_drive_burnout",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Resilience",
    dimension: "drive",
    prompt:
      "It's the last week before finals. You've been studying 8+ hours daily for three weeks. You're exhausted and your retention has dropped.",
    options: [
      {
        id: "a",
        label: "Push through. You can recover after exams. The stakes are too high to ease up now.",
        scores: { drive: 2, structure: 1, risk: 1 },
      },
      {
        id: "b",
        label: "Cut to 5 hours, sleep more, focus on weak spots only. Smart > hard.",
        scores: { drive: 1, decision_style: 2, structure: 1 },
      },
      {
        id: "c",
        label: "Take a full day off. Reset properly. Come back fresh.",
        scores: { drive: 0, decision_style: 1, structure: -1 },
      },
      {
        id: "d",
        label: "I'd already have given up by now and be doom-scrolling.",
        scores: { drive: -2, structure: -1 },
      },
    ],
  },
  // ── Round 3 anchors: money, conflict, failure, curiosity, lifestyle, identity ──
  {
    id: "rt_money_windfall",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Money",
    dimension: "risk",
    prompt:
      "An aunt unexpectedly hands you ₹50,000 with 'just spend it on something good for yourself.' What's your move?",
    options: [
      {
        id: "a",
        label: "Save 80%. Invest a piece. Treat myself with the rest. Boring but smart.",
        scores: { risk: -1, structure: 2, decision_style: 1 },
      },
      {
        id: "b",
        label: "One big experience — a trip, a workshop, a thing I'd remember in 10 years.",
        scores: { risk: 1, drive: 1, energy: 1 },
      },
      {
        id: "c",
        label: "Buy the laptop / camera / gear I've been wanting forever. Tools, not stuff.",
        scores: { risk: 0, drive: 2, structure: 1 },
      },
      {
        id: "d",
        label: "Honestly, half of it would be gone in a week before I really thought about it.",
        scores: { risk: 2, structure: -2, decision_style: -2 },
      },
    ],
  },
  {
    id: "rt_conflict_publicly_wrong",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Conflict",
    dimension: "decision_style",
    prompt:
      "You confidently made a claim in front of a group. Mid-sentence someone shows you, with receipts, that you're wrong.",
    options: [
      {
        id: "a",
        label: "Stop, say 'okay yeah you're right', adjust live. Move on inside two seconds.",
        scores: { decision_style: 2, social: 1, drive: 1 },
      },
      {
        id: "b",
        label: "Acknowledge it but defend the spirit of what I meant. Save some face.",
        scores: { decision_style: 1, social: 0, energy: 1 },
      },
      {
        id: "c",
        label: "Get quiet. Stew on it for the rest of the conversation.",
        scores: { decision_style: -1, social: -1, energy: -1 },
      },
      {
        id: "d",
        label: "Push back hard, even if I'm not sure. The room respects confidence.",
        scores: { decision_style: -1, risk: 2, social: -2 },
      },
    ],
  },
  {
    id: "rt_curiosity_rabbithole",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Curiosity",
    dimension: "drive",
    prompt:
      "You hear something interesting in passing — a half-fact, a name, a concept you've never come across. The next 24 hours look like:",
    options: [
      {
        id: "a",
        label: "Three Wikipedia tabs deep within an hour. By next week I'll know more than the person who said it.",
        scores: { drive: 2, decision_style: 1, structure: 0 },
      },
      {
        id: "b",
        label: "Mental note. I'll get to it eventually. Maybe.",
        scores: { drive: 0, structure: -1, decision_style: 0 },
      },
      {
        id: "c",
        label: "Bring it up with someone smart who'd know more, save myself the search.",
        scores: { drive: 1, social: 2, energy: 1 },
      },
      {
        id: "d",
        label: "If it's not directly useful to me, it won't stick.",
        scores: { drive: -1, decision_style: 1, structure: 1 },
      },
    ],
  },
  {
    id: "rt_failure_publicfail",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Failure",
    dimension: "drive",
    prompt:
      "You bombed a presentation in front of a room that mattered. Walking out, you know you blew it.",
    options: [
      {
        id: "a",
        label: "Replay it that night to figure out exactly what broke. Notes by morning. Already drafting the redo.",
        scores: { drive: 2, decision_style: 2, structure: 1 },
      },
      {
        id: "b",
        label: "Need a day or two of avoidance. Then I'll process it. Then I'll come back stronger.",
        scores: { drive: 1, structure: 0, energy: -1 },
      },
      {
        id: "c",
        label: "Carry it for weeks. It'll come up in 3 AM thoughts long after everyone else has forgotten.",
        scores: { drive: 0, decision_style: 1, energy: -2 },
      },
      {
        id: "d",
        label: "Talk to friends, laugh about it, decide presenting just isn't my thing.",
        scores: { drive: -1, social: 2, risk: -1 },
      },
    ],
  },
  {
    id: "rt_lifestyle_environment",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Living",
    dimension: "energy",
    prompt:
      "Pick the version of your daily environment that would make you happiest, most energized.",
    options: [
      {
        id: "a",
        label: "Buzzing city. Cafés, late-night metros, plans materializing two hours before they happen.",
        scores: { energy: 2, social: 2, risk: 1 },
      },
      {
        id: "b",
        label: "Mid-sized place. Quiet street, good coffee within walking distance, my people in a 20-min radius.",
        scores: { energy: 0, social: 1, structure: 1 },
      },
      {
        id: "c",
        label: "Off the beaten path. Big sky, less noise, maybe a college town with character.",
        scores: { energy: -1, social: -1, structure: 0 },
      },
      {
        id: "d",
        label: "Honestly I just need a great room. The city around it doesn't matter that much.",
        scores: { energy: -2, social: -2, drive: 1 },
      },
    ],
  },
  {
    id: "rt_identity_compliments",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Identity",
    dimension: "social",
    prompt:
      "What's the kind of compliment that actually lands for you? The one that makes you feel seen, not just flattered.",
    options: [
      {
        id: "a",
        label: "'You actually thought about that, didn't you' — being recognized for the thinking under the work.",
        scores: { decision_style: 2, drive: 1, social: 0 },
      },
      {
        id: "b",
        label: "'You made everyone in that room feel comfortable' — the people piece, not the work.",
        scores: { social: 2, energy: 1, drive: 0 },
      },
      {
        id: "c",
        label: "'You just got it done while everyone else was still talking' — the bias to action.",
        scores: { drive: 2, decision_style: 1, structure: 1 },
      },
      {
        id: "d",
        label: "'I've never seen anyone do it that way' — the originality.",
        scores: { risk: 2, drive: 1, structure: -1 },
      },
    ],
  },
];
