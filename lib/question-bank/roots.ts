import type { Question } from "../types";

export const ROOTS_ANCHORS: Question[] = [
  {
    id: "rt_energy",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Personality Energy",
    dimension: "energy",
    prompt: "What sounds most like your ideal weekend?",
    options: [
      { id: "a", label: "Going out and meeting people", scores: { energy: 2, social: 1 } },
      { id: "b", label: "Spending time with close friends", scores: { energy: 0, social: 1 } },
      { id: "c", label: "Building/creating something alone", scores: { energy: -2, drive: 2, structure: 1 } },
      { id: "d", label: "Relaxing and recharging quietly", scores: { energy: -2, social: -1 } },
      { id: "e", label: "Doing whatever feels spontaneous", scores: { energy: 1, structure: -2, risk: 2 } }
    ]
  },
  {
    id: "rt_work_style",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Work Style",
    dimension: "decision_style",
    prompt: "Your group project is a mess the night before submission. What do you do?",
    options: [
      { id: "a", label: "Take charge and fix everything", scores: { decision_style: 2, drive: 2, structure: 1 } },
      { id: "b", label: "Calm everyone down and plan it out", scores: { decision_style: 2, structure: 2, social: 1 } },
      { id: "c", label: "Finish only my part properly", scores: { decision_style: 1, social: -2, drive: 0 } },
      { id: "d", label: "Ask others for help and divide work", scores: { decision_style: -1, social: 2, energy: 1 } },
      { id: "e", label: "Hope things somehow work out", scores: { decision_style: -2, structure: -2, risk: 1 } }
    ]
  },
  {
    id: "rt_risk_ambition",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Risk & Ambition",
    dimension: "risk",
    prompt: "A startup opportunity appears right before exams. You:",
    options: [
      { id: "a", label: "Take the risk immediately", scores: { risk: 2, drive: 2, decision_style: -1 } },
      { id: "b", label: "Balance both carefully", scores: { risk: 1, structure: 2, drive: 1 } },
      { id: "c", label: "Join later after exams", scores: { risk: -1, structure: 1, decision_style: 1 } },
      { id: "d", label: "Focus only on academics", scores: { risk: -2, structure: 2 } },
      { id: "e", label: "Ask others before deciding", scores: { risk: 0, social: 2, decision_style: 1 } }
    ]
  },
  {
    id: "rt_values",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Values",
    dimension: "social",
    prompt: "Which matters most to you in life?",
    options: [
      { id: "a", label: "Financial freedom", scores: { risk: 1, drive: 1 } },
      { id: "b", label: "Recognition and success", scores: { drive: 2, social: -1 } },
      { id: "c", label: "Deep relationships", scores: { social: 2, energy: 1 } },
      { id: "d", label: "Creativity and passion", scores: { risk: 2, structure: -1, drive: 1 } },
      { id: "e", label: "Peace and stability", scores: { structure: 2, risk: -2 } }
    ]
  },
  {
    id: "rt_social_side",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Social Side",
    dimension: "social",
    prompt: "In a room full of strangers, you're most likely to:",
    options: [
      { id: "a", label: "Start conversations confidently", scores: { social: 2, energy: 2, risk: 1 } },
      { id: "b", label: "Find one interesting person", scores: { social: 1, energy: 0 } },
      { id: "c", label: "Stay near familiar people", scores: { social: 0, energy: -1 } },
      { id: "d", label: "Observe quietly at first", scores: { social: -1, energy: -2 } },
      { id: "e", label: "Leave early if possible", scores: { social: -2, energy: -2, risk: -1 } }
    ]
  },
  {
    id: "rt_pressure_response",
    section: "roots",
    kind: "anchor",
    type: "single_choice",
    category: "Pressure Response",
    dimension: "drive",
    prompt: "You receive harsh feedback on something important. Your first reaction is:",
    options: [
      { id: "a", label: "Fix it immediately", scores: { drive: 2, decision_style: 1 } },
      { id: "b", label: "Take time, then improve it", scores: { drive: 1, decision_style: 2, structure: 1 } },
      { id: "c", label: "Ask someone I trust for advice", scores: { social: 2, drive: 0 } },
      { id: "d", label: "Feel bad but move on slowly", scores: { drive: -1, energy: -1 } },
      { id: "e", label: "Restart everything from scratch", scores: { drive: 1, risk: 2, structure: -1 } }
    ]
  }
];
