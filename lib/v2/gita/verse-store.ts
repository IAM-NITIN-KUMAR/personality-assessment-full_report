// The verses of the Bhagavad Gita, searched by meaning.
//
// data/verses.json holds every verse with its vector (built once by scripts/build-gita-index.mjs).
// A search turns the query into a vector with the same model and returns the closest verses by
// cosine distance: 0 is the same direction, 1 is unrelated.

import type { Embedder } from "./gemini";

export interface Verse {
  /** Citation as shown to the student, e.g. "Gita 2.47". Unique per verse. */
  ref: string;
  text: string;
}

export interface Hit {
  verse: Verse;
  distance: number;
}

/** What reply.ts needs from the verses. Tests pass a fake. */
export interface VerseStore {
  /** The k closest verses, nearest first. */
  search(query: string, k: number): Promise<Hit[]>;
  count(): number;
}

export interface VerseIndex {
  model: string;
  dims: number;
  verses: Verse[];
  /** One vector per verse, in order: signed bytes (component x 127), base64. */
  vectors: string;
}

/** Each verse's vector at unit length, back to back. */
function decode(index: VerseIndex): Float32Array {
  const bytes = Buffer.from(index.vectors, "base64");
  const { dims, verses } = index;
  if (bytes.length !== dims * verses.length) throw new Error("verse index: vectors do not match the verses");
  const signed = new Int8Array(bytes.buffer, bytes.byteOffset, bytes.length);
  const out = new Float32Array(signed.length);
  for (let v = 0; v < verses.length; v++) {
    let sum = 0;
    for (let i = v * dims; i < (v + 1) * dims; i++) sum += signed[i] * signed[i];
    const length = Math.sqrt(sum) || 1;
    for (let i = v * dims; i < (v + 1) * dims; i++) out[i] = signed[i] / length;
  }
  return out;
}

export function createVerseStore(index: VerseIndex, embed: Embedder): VerseStore {
  let vectors: Float32Array | null = null; // decoded on first search
  return {
    count: () => index.verses.length,
    async search(query, k) {
      if (index.verses.length === 0 || k <= 0) return [];
      const [q] = await embed([query], "query");
      if (q.length !== index.dims) throw new Error("verse search: the query vector has the wrong size");
      vectors ??= decode(index);
      const hits: Hit[] = index.verses.map((verse, v) => {
        let dot = 0;
        for (let i = 0, at = v * index.dims; i < index.dims; i++) dot += vectors![at + i] * q[i];
        return { verse, distance: 1 - dot };
      });
      return hits.sort((a, b) => a.distance - b.distance).slice(0, k);
    },
  };
}
