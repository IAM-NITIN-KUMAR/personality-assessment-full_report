// Builds lib/v2/gita/data/verses.json: every verse of the Gita with the vector "Ask the Gita"
// searches by. Run it again only if the translation, the embedding model or its size changes
// (EMBEDDING_MODEL and EMBEDDING_DIMS in lib/v2/gita/gemini.ts must say the same as here).
//
//   node scripts/build-gita-index.mjs <gita_purohit_swami.json> [--cache <file>]
//
// The source file is data/raw/gita/gita_purohit_swami.json in THE GITA PROJECT. The Gemini key
// is read from GEMINI_API_KEY (or GOOGLE_API_KEY), in the environment or in .env.local.
// The free tier allows about 100 requests a minute, so a full run takes several minutes; with
// --cache, finished verses are kept in that file and a second run picks up where the first stopped.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = "gemini-embedding-2";
const DIMS = 768;
const PLACEHOLDER = "shri purohit swami did not comment on this sloka";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "lib", "v2", "gita", "data", "verses.json");

const args = process.argv.slice(2);
const cacheAt = args.indexOf("--cache");
const cacheFile = cacheAt >= 0 ? args.splice(cacheAt, 2)[1] : null;
const source = args[0];
if (!source) {
  console.error("usage: node scripts/build-gita-index.mjs <gita_purohit_swami.json> [--cache <file>]");
  process.exit(2);
}

function keyFromEnv() {
  const names = ["GEMINI_API_KEY", "GOOGLE_API_KEY"];
  for (const name of names) if (process.env[name]?.trim()) return process.env[name].trim();
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return "";
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
    if (m && names.includes(m[1]) && m[2].trim()) return m[2].trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

/** The verses of the source file, skipping the few with no translation text. */
function loadVerses(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const verses = [];
  for (const entry of data.verses) {
    const text = (entry.english || "").replace(/^\s*\d+\.\d+\s*/, "").split(/\s+/).filter(Boolean).join(" ");
    if (!text || text.replace(/\.+$/, "").toLowerCase() === PLACEHOLDER) continue;
    verses.push({ ref: `Gita ${entry.chapter}.${entry.verse}`, text });
  }
  return { verses, origin: data.source ?? "" };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = cacheFile && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
const saveCache = () => cacheFile && fs.writeFileSync(cacheFile, JSON.stringify(cache));
let key = "";

async function embed(text) {
  const id = "RETRIEVAL_DOCUMENT|" + text;
  if (cache[id]) return cache[id];
  key ||= keyFromEnv();
  if (!key) throw new Error("No Gemini key: set GEMINI_API_KEY in the environment or in .env.local.");
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: `models/${MODEL}`, content: { parts: [{ text }] }, taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: DIMS }),
    });
    if (res.ok) {
      const values = (await res.json()).embedding.values;
      const length = Math.hypot(...values) || 1;
      cache[id] = values.map((x) => Math.round((x / length) * 1e5) / 1e5);
      return cache[id];
    }
    if (res.status !== 429 && res.status < 500) throw new Error(`Gemini answered HTTP ${res.status}`);
    await sleep(Math.min(60_000, 4_000 * (attempt + 1))); // over the per-minute quota, or busy: wait and try again
  }
  throw new Error("Gemini kept refusing; the daily quota may be used up. Run again later with the same --cache file.");
}

const { verses, origin } = loadVerses(source);
const vectors = new Array(verses.length);
let next = 0;
let done = 0;
try {
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < verses.length) {
        const i = next++;
        vectors[i] = await embed(verses[i].text);
        if (++done % 100 === 0) {
          console.log(`${done}/${verses.length}`);
          saveCache();
        }
      }
    }),
  );
} finally {
  saveCache();
}

// One signed byte per component is plenty for ranking, and keeps the file small.
const bytes = new Int8Array(verses.length * DIMS);
vectors.forEach((vector, v) => vector.forEach((x, i) => (bytes[v * DIMS + i] = Math.max(-127, Math.min(127, Math.round(x * 127))))));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({
    translation: "Shri Purohit Swami, 1935",
    origin,
    model: MODEL,
    dims: DIMS,
    verses,
    vectors: Buffer.from(bytes.buffer).toString("base64"),
  }) + "\n",
);
console.log(`Wrote ${verses.length} verses to ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
