import type { Question } from "../types";

export const ROUTES_BCA: Question[] = [
  {
    "id": "rb_career_picture",
    "section": "routes",
    "kind": "anchor",
    "type": "single_choice",
    "category": "Career Picture",
    "dimension": "drive",
    "prompt": "Three years after college, what feels like success?",
    "options": [
      {
        "id": "a",
        "label": "Working at a top company",
        "scores": {
          "drive": 2,
          "structure": 1
        }
      },
      {
        "id": "b",
        "label": "Running my own startup",
        "scores": {
          "drive": 2,
          "risk": 2,
          "social": -1
        }
      },
      {
        "id": "c",
        "label": "Obtaining / finishing my masters",
        "scores": {
          "drive": 1,
          "structure": 2,
          "decision_style": 2
        }
      },
      {
        "id": "d",
        "label": "Exploring different paths",
        "scores": {
          "drive": 0,
          "risk": 1,
          "structure": -2
        }
      },
      {
        "id": "e",
        "label": "Doing work I genuinely enjoy",
        "scores": {
          "drive": 2,
          "risk": 1,
          "structure": 0
        }
      }
    ]
  },
  {
    "id": "rb_7427",
    "section": "routes",
    "kind": "anchor",
    "type": "single_choice",
    "category": "Quick Question",
    "prompt": "What if you had an app that managed all your workflows — your schedule, assignments, reminders — guided you toward your career every single day, and showed you internship opportunities near you, curated just for you. How much would you pay for it?",
    "dimension": "drive",
    "options": [
      {
        "id": "a",
        "label": "₹49 – ₹99/month — I'd try it",
        "scores": {
          "drive": 1
        }
      },
      {
        "id": "b",
        "label": "₹100 – ₹149/month - i actually needed it ",
        "scores": {
          "drive": -1
        }
      },
      {
        "id": "c",
        "label": "₹150 – ₹199/month — If it actually works, yes",
        "scores": {}
      },
      {
        "id": "d",
        "label": "Free But Limited  Feature ",
        "scores": {}
      }
    ]
  }
];

export const ROUTES_BCA_ENGAGEMENT: Question = {
  "id": "rb_engagement",
  "section": "routes",
  "kind": "engagement",
  "type": "single_choice",
  "category": "Honest Check",
  "prompt": "Outside of college/work, what are you naturally drawn towards?",
  "hint": "There's no right answer. We're trying to read your real connection to this field, not your resume.",
  "options": [
    {
      "id": "a",
      "label": "Learning and building new things",
      "tag": "engagement:3"
    },
    {
      "id": "b",
      "label": "Content, media, and trends",
      "tag": "engagement:2"
    },
    {
      "id": "c",
      "label": "Business ideas and opportunities",
      "tag": "engagement:2"
    },
    {
      "id": "d",
      "label": "Creative hobbies and expression",
      "tag": "engagement:1"
    },
    {
      "id": "e",
      "label": "Still figuring myself out",
      "tag": "engagement:0"
    }
  ]
};
