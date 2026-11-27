// Caps "Ask the Gita" questions per student and in total for each UTC day, so the public page
// cannot run up a bill or use up the model's daily quota for everyone.
//
// Counts live in memory. On Vercel each running copy of the server keeps its own count and a
// restart clears it, so the caps are a brake, not an exact limit. A cap of 0 means no cap.

export const DEFAULT_DAILY_PER_STUDENT = 40;
export const DEFAULT_DAILY_TOTAL = 2000;

const utcDay = () => new Date().toISOString().slice(0, 10);

export class DailyLimiter {
  private day: string;
  private byStudent = new Map<string, number>();
  private count = 0;

  constructor(
    readonly perStudent: number,
    readonly total: number,
    private readonly today: () => string = utcDay,
  ) {
    this.day = today();
  }

  /** Count one question for this student; false if either cap is already used up. */
  allow(student: string): boolean {
    const day = this.today();
    if (day !== this.day) {
      this.day = day;
      this.byStudent = new Map();
      this.count = 0;
    }
    if (this.total && this.count >= this.total) return false;
    const used = this.byStudent.get(student) ?? 0;
    if (this.perStudent && used >= this.perStudent) return false;
    this.byStudent.set(student, used + 1);
    this.count += 1;
    return true;
  }
}

/** A whole number from an environment variable, never negative; the default when unset or not a number. */
export function envInt(value: string | undefined, fallback: number): number {
  const raw = (value ?? "").trim();
  // Plain digits only: "1e3" or "0x10" is more likely a typo than a cap someone meant.
  return /^[+-]?\d+$/.test(raw) ? Math.max(Number(raw), 0) : fallback;
}
