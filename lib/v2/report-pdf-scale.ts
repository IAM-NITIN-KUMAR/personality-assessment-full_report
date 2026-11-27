// Plans how to set a report so that every sheet of its PDF comes out full.
//
// The PDF is one run of rows that cannot be split across sheets. Left alone, each sheet is filled
// until the next row does not fit, so sheets end ragged and the last ends wherever the content
// does. And because a row can be a third of a sheet tall, no one size for the whole report fixes
// that: some sheet is always left well short. So the plan works sheet by sheet, from nothing but
// the height of every row at each size:
//
//   1. Break. The rows are divided between the sheets so the sheets are as evenly full as they can be.
//   2. Size. Everything on a sheet scales together, and each sheet is set at the largest size at
//      which its rows fit. The sheets of a report stay within a few steps of size of one another.
//   3. Spread. The final render shares the little room still left on a sheet between its rows
//      (report-pdf.tsx), so every sheet ends at its foot.
//
// Nothing here renders anything: report-pdf-fit.tsx measures the rows and renders the result.

/**
 * The sizes a sheet can be set at (1 = the designed size). Below the first the small print gets
 * hard to read; above the last it looks like large print.
 */
export const SIZES = [0.9, 0.94, 0.98, 1.02, 1.06, 1.1, 1.14, 1.18, 1.22, 1.26, 1.3];

/**
 * How many steps of size apart the sheets of one report may be. Measured over the report's many
 * shapes, three steps leave about 3% of the sheets empty; one step leaves a tenth of some reports empty.
 */
const STEPS_APART = 3;

/** The renderer lets a row sit this far over the foot of a sheet before moving it on. */
const TOLERANCE = 0.001;

/** How much a plan is marked down for being away from the designed size. */
const SIZE_WEIGHT = 0.12;

export interface Plan {
  /** The size of each row, in order. The rows of one sheet share a size. */
  sizes: number[];
  /** The rows that start a new sheet. */
  breaks: Set<number>;
  sheets: number;
  /** The share of the sheets left empty, to be spread between the rows. 0 is every sheet full. */
  empty: number;
}

/** Sheets needed when each is filled until the next row does not fit — the fewest any breaks can give. */
export function sheetsNeeded(heights: readonly number[], sheet: number): number {
  let sheets = heights.length ? 1 : 0;
  let used = 0;
  for (const h of heights) {
    if (used > 0 && used + h > sheet + TOLERANCE) {
      sheets += 1;
      used = 0;
    }
    used += h;
  }
  return sheets;
}

/**
 * The best plan that sets every sheet at `sizes[base]` or up to STEPS_APART steps larger.
 * `heights[a][i]` is the height of row i at `sizes[a]`.
 */
function planAt(heights: readonly (readonly number[])[], sizes: readonly number[], base: number, sheet: number): Plan | null {
  const n = heights[base].length;
  if (n === 0) return null;
  // Largest first, so a sheet takes the larger size whenever its rows fit at it.
  const allowed: number[] = [];
  for (let a = Math.min(sizes.length - 1, base + STEPS_APART); a >= base; a--) allowed.push(a);
  const total = new Map(allowed.map((a) => {
    const sums = [0];
    for (const h of heights[a]) sums.push(sums[sums.length - 1] + h);
    return [a, sums] as const;
  }));

  /** One sheet holding rows `from` up to (not including) `to`: the size it takes and the room it leaves. */
  const sheetOf = (from: number, to: number): { size: number; room: number } | null => {
    for (const a of allowed) {
      const used = total.get(a)![to] - total.get(a)![from];
      if (used <= sheet + TOLERANCE) return { size: a, room: Math.max(0, sheet - used) };
    }
    // A row taller than a sheet has one to itself, at the smaller size.
    return to - from === 1 ? { size: base, room: 0 } : null;
  };

  const sheets = sheetsNeeded(heights[base], sheet);
  // best[p][i]: the least cost of putting the first i rows on p sheets; cut[p][i]: where its last sheet starts.
  // The cost of a sheet is the square of the room it leaves, so room is shared out rather than piled up.
  const best = Array.from({ length: sheets + 1 }, () => new Array<number>(n + 1).fill(Infinity));
  const cut = Array.from({ length: sheets + 1 }, () => new Array<number>(n + 1).fill(-1));
  best[0][0] = 0;
  for (let p = 1; p <= sheets; p++) {
    for (let i = p; i <= n; i++) {
      for (let j = p - 1; j < i; j++) {
        if (!Number.isFinite(best[p - 1][j])) continue;
        const one = sheetOf(j, i);
        if (!one) continue;
        const cost = best[p - 1][j] + one.room ** 2;
        if (cost < best[p][i]) {
          best[p][i] = cost;
          cut[p][i] = j;
        }
      }
    }
  }
  if (!Number.isFinite(best[sheets][n])) return null;

  const plan: Plan = { sizes: new Array<number>(n).fill(sizes[base]), breaks: new Set<number>(), sheets, empty: 0 };
  let room = 0;
  for (let p = sheets, to = n; p >= 1; p--) {
    const from = cut[p][to];
    const one = sheetOf(from, to)!;
    for (let i = from; i < to; i++) plan.sizes[i] = sizes[one.size];
    if (from > 0) plan.breaks.add(from);
    room += one.room;
    to = from;
  }
  plan.empty = room / (sheets * sheet);
  return plan;
}

/** How good a plan is: the share of its sheets left empty, plus a little for being away from the designed size. Lower is better. */
export function score(plan: Plan): number {
  const size = plan.sizes.reduce((sum, k) => sum + k, 0) / Math.max(1, plan.sizes.length);
  return plan.empty + SIZE_WEIGHT * Math.abs(Math.log(size));
}

/**
 * The plan for a report, from the height of every row at every size: `heights[a][i]` is the height
 * of row i at `sizes[a]`, and `sheet` the height a sheet has for rows.
 */
export function planReport(heights: readonly (readonly number[])[], sheet: number, sizes: readonly number[] = SIZES): Plan {
  let best: Plan | null = null;
  for (let base = 0; base < sizes.length; base++) {
    const plan = planAt(heights, sizes, base, sheet);
    if (plan && (!best || score(plan) < score(best))) best = plan;
  }
  if (!best) throw new Error("no rows to plan");
  return best;
}
