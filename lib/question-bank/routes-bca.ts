import type { Question } from "../types";

export const ROUTES_BCA: Question[] = [
  {
    id: "q21",
    section: "reality_check",
    kind: "anchor",
    type: "single_choice",
    category: "Reality Check",
    dimension: "decision_style",
    prompt: "Big decisions — how do you make ’em?",
    options: [
      { id: "a", label: "Gut feeling, I just know ✨", scores: { decision_style: -2, risk: 2 }, tag: "decide:gut" },
      { id: "b", label: "Research everything first 🔎", scores: { decision_style: 2, structure: 1 }, tag: "decide:research" },
      { id: "c", label: "Ask everyone for advice 📞", scores: { social: 2, decision_style: 1 }, tag: "decide:advice" },
      { id: "d", label: "Avoid it till I have to 😬", scores: { decision_style: -1, drive: -2 }, tag: "decide:avoid" }
    ]
  },
  {
    id: "q22",
    section: "reality_check",
    kind: "anchor",
    type: "single_choice",
    category: "Reality Check",
    prompt: "Who’s in your corner for this?",
    options: [
      { id: "a", label: "Family’s fully backing me 👨‍👩‍👧", tag: "free support:family" },
      { id: "b", label: "Friends hype me up 🙌", tag: "opinions support:peers" },
      { id: "c", label: "A mentor/teacher’s guiding me", tag: "specific support:mentor" },
      { id: "d", label: "Figuring it out solo 🧍", tag: "locked support:solo" }
    ]
  },
  {
    id: "q23",
    section: "reality_check",
    kind: "anchor",
    type: "single_choice",
    category: "Reality Check",
    prompt: "Biggest worry about going abroad?",
    options: [
      { id: "a", label: "The money 💸", tag: "concern:money" },
      { id: "b", label: "Missing home/people 🏠", tag: "concern:homesick" },
      { id: "c", label: "Safety / being alone 🛡️", tag: "concern:safety" },
      { id: "d", label: "Keeping up academically 📚", tag: "concern:academics" }
    ]
  },
  {
    id: "q24",
    section: "reality_check",
    kind: "anchor",
    type: "single_choice",
    category: "Reality Check",
    prompt: "When do you wanna make your move?",
    options: [
      { id: "a", label: "ASAP, this year ⚡", tag: "tl:now timeline:now" },
      { id: "b", label: "Next year for sure", tag: "tl:1y timeline:soon" },
      { id: "c", label: "In 2–3 years", tag: "tl:2y timeline:planning" },
      { id: "d", label: "It’s a someday dream 🌙", tag: "tl:open timeline:later" }
    ]
  }
];

export const ROUTES_BCA_ENGAGEMENT: Question = {
  id: "q25",
  section: "reality_check",
  kind: "engagement",
  type: "single_choice",
  category: "Reality Check",
  prompt: "How much guidance do you want rn?",
  options: [
    { id: "a", label: "A lot — guide me step by step 🙏", tag: "guidance:high" },
    { id: "b", label: "A fair bit, check in often", tag: "guidance:mid" },
    { id: "c", label: "Just point me the right way", tag: "guidance:low" },
    { id: "d", label: "Just exploring for now 👀", tag: "guidance:vlow" }
  ]
};
