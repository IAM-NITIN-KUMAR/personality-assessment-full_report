import type { Question } from "../types";

export const ROOTS_ANCHORS: Question[] = [
  {
    id: "q01",
    section: "main_character",
    kind: "anchor",
    type: "single_choice",
    category: "Main Character Energy",
    dimension: "energy",
    prompt: "New room, full of strangers. You’re…",
    options: [
      { id: "a", label: "Working the whole room, hi bestie 👋", scores: { social: 2, energy: 2 }, tag: "social:extrovert" },
      { id: "b", label: "Making a couple new friends, easy", scores: { social: 1, energy: 1 }, tag: "social:ambivert" },
      { id: "c", label: "Sticking with who I came with 🫂", scores: { social: 0, energy: -1 }, tag: "social:selective" },
      { id: "d", label: "Finding the nearest wall 🧍", scores: { social: -1, energy: -2 }, tag: "social:introvert" }
    ]
  },
  {
    id: "q02",
    section: "main_character",
    kind: "anchor",
    type: "single_choice",
    category: "Main Character Energy",
    dimension: "decision_style",
    prompt: "You actually learn stuff best by…",
    options: [
      { id: "a", label: "Just letting me DO it", scores: { drive: 2, structure: -1 }, tag: "learn:kinesthetic" },
      { id: "b", label: "Watching vids till it clicks", scores: { decision_style: 1, energy: -1 }, tag: "learn:visual" },
      { id: "c", label: "Reading + notes lowkey", scores: { decision_style: 2, structure: 1, social: -1 }, tag: "learn:reading" },
      { id: "d", label: "Explaining it / group study", scores: { social: 2, energy: 1 }, tag: "learn:social" }
    ]
  },
  {
    id: "q03",
    section: "main_character",
    kind: "anchor",
    type: "single_choice",
    category: "Main Character Energy",
    dimension: "risk",
    prompt: "Plans change last minute. You…",
    options: [
      { id: "a", label: "Change is fun, let’s go 🌊", scores: { risk: 2, structure: -2 }, tag: "adapt:high" },
      { id: "b", label: "Quick reset, then I’m good", scores: { risk: 1, structure: -1 }, tag: "adapt:mid" },
      { id: "c", label: "Stresses me but I cope", scores: { risk: -1, structure: 1 }, tag: "adapt:low" },
      { id: "d", label: "Ugh, I needed that plan 😤", scores: { risk: -2, structure: 2 }, tag: "adapt:vlow" }
    ]
  },
  {
    id: "q04",
    section: "main_character",
    kind: "anchor",
    type: "single_choice",
    category: "Main Character Energy",
    dimension: "structure",
    prompt: "You + deadlines = ?",
    options: [
      { id: "a", label: "Done way early, built different", scores: { drive: 2, structure: 2 }, tag: "time:proactive" },
      { id: "b", label: "Right on time, every time", scores: { structure: 2 }, tag: "time:ontime" },
      { id: "c", label: "Cutting it close but I deliver", scores: { structure: -1 }, tag: "time:late" },
      { id: "d", label: "3am the night before 💀", scores: { structure: -2, drive: -1 }, tag: "time:procrastinator" }
    ]
  },
  {
    id: "q05",
    section: "main_character",
    kind: "anchor",
    type: "single_choice",
    category: "Main Character Energy",
    dimension: "drive",
    prompt: "What hypes you up the MOST?",
    options: [
      { id: "a", label: "People seeing my W’s 🏆", scores: { drive: 1, energy: 1 }, tag: "drive:recognition" },
      { id: "b", label: "The bag 💰", scores: { drive: 2 }, tag: "drive:money" },
      { id: "c", label: "Actually changing things 🌍", scores: { social: 2, drive: 1 }, tag: "drive:impact" },
      { id: "d", label: "Freedom to do me ✌️", scores: { risk: 2, social: -1 }, tag: "drive:freedom" }
    ]
  },
  {
    id: "q16",
    section: "skill_check",
    kind: "anchor",
    type: "single_choice",
    category: "Skill Check",
    dimension: "risk",
    prompt: "Your actual superpower is…",
    options: [
      { id: "a", label: "Big ideas + creativity 🎨", scores: { risk: 2, structure: -1 }, tag: "skill:creative" },
      { id: "b", label: "Puzzles + logic 🧩", scores: { decision_style: 2, structure: 1 }, tag: "skill:analytical" },
      { id: "c", label: "Leading / talking to people 🗣️", scores: { social: 2, energy: 1 }, tag: "skill:people" },
      { id: "d", label: "Hands-on / tech / building 🛠️", scores: { drive: 2, structure: 1 }, tag: "skill:technical" }
    ]
  },
  {
    id: "q17",
    section: "skill_check",
    kind: "anchor",
    type: "single_choice",
    category: "Skill Check",
    dimension: "social",
    prompt: "Group project — your role?",
    options: [
      { id: "a", label: "The leader, I run it 👑", scores: { drive: 2, social: 1 }, tag: "team:leader" },
      { id: "b", label: "The brain, I do the work 🧠", scores: { decision_style: 2, social: -1 }, tag: "team:doer" },
      { id: "c", label: "The vibe + glue 🤝", scores: { social: 2, energy: 1 }, tag: "team:connector" },
      { id: "d", label: "I disappear ngl 👻", scores: { drive: -2, social: -2 }, tag: "team:passive" }
    ]
  },
  {
    id: "q18",
    section: "skill_check",
    kind: "anchor",
    type: "single_choice",
    category: "Skill Check",
    dimension: "structure",
    prompt: "Tech & digital comfort?",
    options: [
      { id: "a", label: "Basically the IT person 💻", scores: { drive: 1, structure: 1 }, tag: "tech:high" },
      { id: "b", label: "Comfortable with most things", scores: { structure: 0 }, tag: "tech:mid" },
      { id: "c", label: "I get by, slowly", scores: { structure: -1 }, tag: "tech:low" },
      { id: "d", label: "Tech kinda scares me 😅", scores: { risk: -2, structure: -1 }, tag: "tech:vlow" }
    ]
  },
  {
    id: "q19",
    section: "skill_check",
    kind: "anchor",
    type: "single_choice",
    category: "Skill Check",
    dimension: "drive",
    prompt: "When you fail at something, you…",
    options: [
      { id: "a", label: "Lesson learned, run it back 💪", scores: { drive: 2, risk: 1 }, tag: "resilience:high" },
      { id: "b", label: "Bounce back after a beat", scores: { drive: 1 }, tag: "resilience:mid" },
      { id: "c", label: "Takes me a while to recover", scores: { drive: -1 }, tag: "resilience:low" },
      { id: "d", label: "Spiral for a long time 🌀", scores: { drive: -2 }, tag: "resilience:vlow" }
    ]
  },
  {
    id: "q20",
    section: "skill_check",
    kind: "anchor",
    type: "single_choice",
    category: "Skill Check",
    dimension: "drive",
    prompt: "Task you’d happily do ALL day?",
    options: [
      { id: "a", label: "Designing / creating stuff", scores: { risk: 2, structure: -1 }, tag: "skill:creative" },
      { id: "b", label: "Analyzing data / strategy", scores: { decision_style: 2, structure: 1 }, tag: "skill:analytical" },
      { id: "c", label: "Meeting + helping people", scores: { social: 2, energy: 1 }, tag: "skill:people" },
      { id: "d", label: "Building / fixing / coding", scores: { drive: 2, structure: 1 }, tag: "skill:technical" }
    ]
  }
];
