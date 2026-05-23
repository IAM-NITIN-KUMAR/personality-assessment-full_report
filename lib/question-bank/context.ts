import type { Question } from "../types";

export const CONTEXT_QUESTIONS: Question[] = [
  {
    id: "ctx_goals",
    section: "context",
    kind: "context",
    type: "single_choice",
    category: "Future Goals",
    prompt: "What's your biggest goal right now?",
    options: [
      { id: "a", label: "Get into a top college", tag: "goal:college" },
      { id: "b", label: "Build a strong career path", tag: "goal:career" },
      { id: "c", label: "Figure out what actually fits me", tag: "goal:fit" },
      { id: "d", label: "Explore opportunities abroad", tag: "goal:abroad" },
      { id: "e", label: "Make my family proud", tag: "goal:family" }
    ]
  },
  {
    id: "ctx_geo",
    section: "context",
    kind: "context",
    type: "multi_choice",
    category: "Study Destination",
    prompt: "Where would you genuinely be open to studying?",
    options: [
      { id: "g1", label: "India", tag: "geo:in" },
      { id: "g2", label: "UK", tag: "geo:uk" },
      { id: "g3", label: "US / Canada", tag: "geo:na" },
      { id: "g4", label: "Europe / Australia", tag: "geo:eu-anz" },
      { id: "g5", label: "Anywhere with the right opportunity", tag: "geo:open" }
    ]
  }
];
