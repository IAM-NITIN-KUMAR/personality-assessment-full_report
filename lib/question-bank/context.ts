import type { Question } from "../types";

export const CONTEXT_QUESTIONS: Question[] = [
  {
    id: "q06",
    section: "dream_big",
    kind: "context",
    type: "single_choice",
    category: "Dream Big, No Cap",
    prompt: "Your future job vibe is…",
    options: [
      { id: "a", label: "Building / coding / science-y 🔬", tag: "field:stem" },
      { id: "b", label: "Money, business, startups 📈", tag: "field:business" },
      { id: "c", label: "Art, design, content, media 🎨", tag: "field:creative" },
      { id: "d", label: "Helping / health / teaching 🩺", tag: "field:care" }
    ]
  },
  {
    id: "q07",
    section: "dream_big",
    kind: "context",
    type: "single_choice",
    category: "Dream Big, No Cap",
    prompt: "5 years from now you wanna be…",
    options: [
      { id: "a", label: "Deep in a degree, studying 🎓", tag: "global-top orient:study" },
      { id: "b", label: "Working a solid job 💼", tag: "global-mid orient:work" },
      { id: "c", label: "Running my own thing 🚀", tag: "in-fit orient:entrepreneur" },
      { id: "d", label: "Honestly? No clue yet 🤷", tag: "in-fit orient:undecided" }
    ]
  },
  {
    id: "q08",
    section: "dream_big",
    kind: "context",
    type: "single_choice",
    category: "Dream Big, No Cap",
    prompt: "Subject that makes your brain go brrr?",
    options: [
      { id: "a", label: "Tech / Math / Engineering", tag: "field:stem" },
      { id: "b", label: "Business / Econ", tag: "field:business" },
      { id: "c", label: "Arts / Humanities / Design", tag: "field:creative" },
      { id: "d", label: "Bio / Health / Social", tag: "field:care" }
    ]
  },
  {
    id: "q09",
    section: "dream_big",
    kind: "context",
    type: "single_choice",
    category: "Dream Big, No Cap",
    prompt: "Your dream life is more…",
    options: [
      { id: "a", label: "Stable & secure 🏡", tag: "value:stability" },
      { id: "b", label: "Adventure & new places 🌎", tag: "value:adventure" },
      { id: "c", label: "Making an impact 💡", tag: "value:impact" },
      { id: "d", label: "Rich & successful 💎", tag: "value:wealth" }
    ]
  },
  {
    id: "q10",
    section: "dream_big",
    kind: "context",
    type: "single_choice",
    category: "Dream Big, No Cap",
    prompt: "How clear is your career plan rn?",
    options: [
      { id: "a", label: "Crystal clear, locked in 🔒", tag: "clarity:high" },
      { id: "b", label: "Solid direction, some gaps", tag: "clarity:mid" },
      { id: "c", label: "Vibes only, very blurry", tag: "clarity:low" },
      { id: "d", label: "What plan 😭", tag: "clarity:vlow" }
    ]
  },
  {
    id: "q11",
    section: "passport_era",
    kind: "context",
    type: "single_choice",
    category: "Passport Era",
    prompt: "Why study abroad though?",
    options: [
      { id: "a", label: "Top-tier education 🎓", tag: "abroad_why:education" },
      { id: "b", label: "The whole experience 🌍", tag: "abroad_why:experience" },
      { id: "c", label: "Better career + $$ after", tag: "abroad_why:career" },
      { id: "d", label: "New start / change of scene", tag: "abroad_why:reset" }
    ]
  },
  {
    id: "q12",
    section: "passport_era",
    kind: "context",
    type: "multi_choice",
    category: "Passport Era",
    prompt: "Which part of the world is calling?",
    options: [
      { id: "a", label: "US / Canada 🍁", tag: "region:northamerica" },
      { id: "b", label: "UK / Europe 🇪🇺", tag: "region:europe" },
      { id: "c", label: "Australia / NZ 🦘", tag: "region:oceania" },
      { id: "d", label: "Asia / somewhere else 🌏", tag: "region:asia" }
    ]
  },
  {
    id: "q13",
    section: "passport_era",
    kind: "context",
    type: "single_choice",
    category: "Passport Era",
    prompt: "Real talk — your funding plan?",
    options: [
      { id: "a", label: "Fully sorted: savings/scholarship 💪", tag: "30L+ finance:ready" },
      { id: "b", label: "Mostly planned, few gaps", tag: "5-15L finance:partial" },
      { id: "c", label: "Just started looking into it", tag: "<5L finance:exploring" },
      { id: "d", label: "No idea how I’m paying 😬", tag: "<5L finance:unsure" }
    ]
  },
  {
    id: "q14",
    section: "passport_era",
    kind: "context",
    type: "single_choice",
    category: "Passport Era",
    prompt: "Living solo in a new country, you feel…",
    options: [
      { id: "a", label: "Bring it on, I got me 🔥", tag: "independence:high" },
      { id: "b", label: "A little nervous but ready", tag: "independence:mid" },
      { id: "c", label: "Gonna be a learning curve", tag: "independence:low" },
      { id: "d", label: "I’ve never done laundry 🧺", tag: "independence:vlow" }
    ]
  },
  {
    id: "q15",
    section: "passport_era",
    kind: "context",
    type: "single_choice",
    category: "Passport Era",
    prompt: "Language game for a non-English country?",
    options: [
      { id: "a", label: "Multilingual royalty 👑", tag: "language:strong" },
      { id: "b", label: "Decent + I learn fast", tag: "language:ok" },
      { id: "c", label: "Basics only, would struggle", tag: "language:low" },
      { id: "d", label: "English only, send help 🆘", tag: "language:weak" }
    ]
  }
];
