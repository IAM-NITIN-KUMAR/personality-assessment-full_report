// Spots a message that signals self-harm or crisis, before any model is called.
// A match is answered with the help message (CRISIS_MESSAGE in prompts.ts) and nothing else.

// Phrases are written in normalised form (see normalise): lower case, no apostrophes,
// hyphens as spaces, single spaces. Matched on word boundaries.
export const CRISIS_PHRASES: readonly string[] = [
  "suicide",
  "suicidal",
  "kill myself",
  "kill my self",
  "killing myself",
  "killing my self",
  "end my life",
  "end my own life",
  "ending my life",
  "ending my own life",
  "take my life",
  "take my own life",
  "taking my life",
  "taking my own life",
  "want to die",
  "wanna die",
  "want to be dead",
  "wanna be dead",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "self harm",
  "hurt myself",
  "hurting myself",
  "harm myself",
  "harming myself",
  "dont want to live",
  "do not want to live",
  "dont wanna live",
  "do not wanna live",
  "dont want to be alive",
  "do not want to be alive",
  "dont wanna be alive",
  "do not wanna be alive",
  "no reason to live",
  "end it all",
  "ending it all",
  "not worth living",
  "hang myself",
  "hanging myself",
  "dont want to exist",
  "do not want to exist",
  "dont wanna exist",
  "do not wanna exist",
  "nobody would miss me",
  "no one would miss me",
  "unalive myself",
  "unaliving myself",
  "kms",
  "self harming",
  "self harmed",
  "better off without me",
];

// "can't / cannot / won't go on" only counts as a complete thought: at the end of the text or
// before punctuation, or followed by "like this" / "anymore" / "any more" / "living".
// So "I can't go on holiday this year" does not fire.
const CANT_GO_ON =
  "(?:cant|can not|cannot|wont|will not) go on(?=\\s*(?:[.,!?;:]|$)|\\s+(?:like this|anymore|any more|living)\\b)";

// Same idea for "end it" / "end things" and "want to disappear": they only count as a complete
// thought, so "end it with my business partner" and "disappear from social media" do not fire.
const END_THOUGHT = "(?=\\s*(?:[.,!?;:]|$)|\\s+(?:forever|for good|completely|anymore|any more|now|tonight|today)\\b)";
const END_IT = "(?:end|ending) (?:it|things)" + END_THOUGHT;
const DISAPPEAR = "(?:want to|wanna) disappear" + END_THOUGHT;

// "cut myself" but not the idiom "cut myself some slack" / "a break" / "off".
const CUT_MYSELF = "(?:cut|cutting) myself(?!\\s+(?:some|a|off|loose|free|short|shaving|while|cooking)\\b)";

// A wish never to have been born, not the Gita's "the soul is never born".
const NEVER_BORN = "wish (?:i|that i) (?:was|were|had) never (?:been )?born";

// Any overdose, except the figure of speech "overdosing on social media".
const OVERDOSE =
  "(?:overdose|overdosed|overdosing)(?!\\s+on\\s+(?:social media|my phone|work|caffeine|sugar|news|information)\\b)";

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const CRISIS_RE = new RegExp(
  "\\b(?:" +
    [...CRISIS_PHRASES.map(escapeRegExp), CANT_GO_ON, END_IT, DISAPPEAR, CUT_MYSELF, NEVER_BORN, OVERDOSE].join("|") +
    ")\\b",
);

function normalise(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['’‘ʼ`]/g, "")
    .replace(/-/g, " ")
    // A few control characters can stand between words too, so they count as spaces here.
    .split(/[\s\u001c-\u001f\u0085]+/)
    .filter(Boolean)
    .join(" ");
}

/** True if the message signals self-harm or crisis. */
export function isCrisis(message: string): boolean {
  return CRISIS_RE.test(normalise(message));
}
