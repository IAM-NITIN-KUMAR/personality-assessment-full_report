// Turns the report summary into plain text for the model, leaving out anything that
// looks like a personal identifier. report-summary.ts already sends no name, email, phone
// or profile ID; this is the second line of defence, and it works on any JSON object.

const MAX_DEPTH = 6;

// A key is skipped when any of its words is one of these...
const ID_WORDS = new Set(
  `id ids uid uuid guid email mail phone mobile telephone tel whatsapp contact address pincode
   pin zip postcode dob birth birthday birthdate aadhaar aadhar pan passport roll rollno enrollment
   enrolment admission registration regno username login password surname firstname lastname
   fullname middlename nickname studentname father mother parent parents guardian sibling
   school college institute photo avatar signature ip`.split(/\s+/),
);
// ...or contains one of these (catches "emailid", "phonenumber").
const ID_FRAGMENTS = ["email", "phone", "mobile", "aadha", "password"];
// "name" is personal ("name", "student_name", "father_name") unless it names one of these.
const NAME_OK = new Set(
  `test assessment exam quiz report stream subject area section path course career skill trait
   field category domain scale cluster module topic`.split(/\s+/),
);

function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

/** True for keys that look like personal identifiers, and for "_meta" keys. */
export function isIdentifierKey(key: string): boolean {
  if (key.startsWith("_")) return true;
  const words = keyWords(key);
  if (words.length === 0) return true;
  if (words.some((w) => ID_WORDS.has(w) || ID_FRAGMENTS.some((f) => w.includes(f)))) return true;
  if (words.includes("name") || words.includes("names")) return !words.some((w) => NAME_OK.has(w));
  return false;
}

function humanise(key: string): string {
  const text = keyWords(key).join(" ");
  return text.slice(0, 1).toUpperCase() + text.slice(1);
}

type Scalar = string | number | boolean | null | undefined;

function isScalar(value: unknown): value is Scalar {
  return value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function scalar(value: Scalar): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value).split(/\s+/).filter(Boolean).join(" ");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function render(value: unknown, depth: number): string[] {
  if (depth > MAX_DEPTH) return [];
  const pad = "  ".repeat(depth);
  const lines: string[] = [];
  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (isIdentifierKey(key)) continue;
      const label = humanise(key);
      if (isScalar(child)) {
        const text = scalar(child);
        if (text) lines.push(`${pad}${label}: ${text}`);
      } else if (Array.isArray(child) && child.every(isScalar)) {
        const text = child.map(scalar).filter(Boolean).join(", ");
        if (text) lines.push(`${pad}${label}: ${text}`);
      } else {
        const inner = render(child, depth + 1);
        if (inner.length) lines.push(`${pad}${label}:`, ...inner);
      }
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (isScalar(item)) {
        const text = scalar(item);
        if (text) lines.push(`${pad}- ${text}`);
      } else if (isPlainObject(item) && Object.values(item).every(isScalar)) {
        const parts = Object.entries(item)
          .filter(([k, c]) => !isIdentifierKey(k) && scalar(c as Scalar))
          .map(([k, c]) => `${humanise(k)}: ${scalar(c as Scalar)}`);
        if (parts.length) lines.push(`${pad}- ${parts.join("; ")}`);
      } else {
        const inner = render(item, depth + 1);
        if (inner.length) lines.push(`${pad}-`, ...inner);
      }
    }
  }
  return lines;
}

/** Plain readable text for a report object, with personal identifiers left out. */
export function renderReport(report: unknown): string {
  if (!report || typeof report !== "object") return "";
  return render(report, 0).join("\n");
}
