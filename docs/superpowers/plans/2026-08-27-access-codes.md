# Access Codes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the assessment behind one-time security codes that the admin generates from a password-protected dashboard.

**Architecture:** An `access_codes` table in Supabase (RLS locked, service-role only) + Next.js App Router API routes. Redemption is one conditional UPDATE so codes are single-use even under races; the student row is inserted server-side in the same call. Admin auth is a single password checked server-side, carried as an HMAC-signed httpOnly cookie.

**Tech Stack:** Next.js 15 (App Router route handlers), @supabase/supabase-js 2, node:crypto, vitest.

**Spec:** `docs/superpowers/specs/2026-08-27-access-codes-design.md`

## Global Constraints

- New env vars are server-only, never `NEXT_PUBLIC_`: `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
- Code alphabet is exactly `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 chars, no 0/O/1/I); codes are 8 chars, stored normalized (uppercase, no separators), displayed as `XXXX-XXXX`.
- Nothing under `lib/server/` may be imported from a `"use client"` file.
- Tests are vitest, node environment, repo style (pure logic, no network).
- Commit after every green task with the exact message given in the task.

---

### Task 1: SQL migration for `access_codes`

**Files:**
- Create: `supabase/migrations/2026-08-27-access-codes.sql`

**Interfaces:**
- Produces: the `access_codes` table schema every later task assumes.

- [ ] **Step 1: Write the migration file**

```sql
-- Access codes: one-time security codes gating the assessment.
-- Run in the Supabase SQL editor (same workflow as the education_level change).
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text,
  status text not null default 'active' check (status in ('active', 'used', 'revoked')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by_student_id uuid references students(id)
);

-- RLS on, NO policies: the anon key gets zero access.
-- Only the server-side service-role client reads/writes this table.
alter table access_codes enable row level security;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/2026-08-27-access-codes.sql
git commit -m "feat(codes): access_codes table migration (RLS locked, service-role only)"
```

---

### Task 2: Code format helpers (pure)

**Files:**
- Create: `lib/server/access-code-format.ts`
- Test: `tests/v2/access-code-format.test.ts`

**Interfaces:**
- Produces:
  - `generateCode(): string` — 8 chars from the alphabet, normalized form.
  - `normalizeCode(input: string): string` — uppercase, strip spaces/dashes.
  - `formatCode(code: string): string` — `"ABCD2345"` → `"ABCD-2345"`.
  - `CODE_ALPHABET: string`, `CODE_LENGTH: number` (= 8).

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/v2/access-code-format.test.ts
import { describe, it, expect } from "vitest";
import {
  CODE_ALPHABET, CODE_LENGTH, formatCode, generateCode, normalizeCode,
} from "../../lib/server/access-code-format";

describe("access code format", () => {
  it("alphabet has 32 unambiguous chars (no 0/O/1/I)", () => {
    expect(CODE_ALPHABET).toBe("ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
    expect(new Set(CODE_ALPHABET).size).toBe(32);
  });

  it("generateCode returns 8 chars, all from the alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode();
      expect(code).toHaveLength(CODE_LENGTH);
      for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    }
  });

  it("generateCode does not repeat across a large sample", () => {
    const seen = new Set(Array.from({ length: 1000 }, () => generateCode()));
    expect(seen.size).toBe(1000);
  });

  it("normalizeCode uppercases and strips dashes and spaces", () => {
    expect(normalizeCode(" abcd-2345 ")).toBe("ABCD2345");
    expect(normalizeCode("AB cd 23-45")).toBe("ABCD2345");
  });

  it("formatCode inserts the display dash", () => {
    expect(formatCode("ABCD2345")).toBe("ABCD-2345");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/v2/access-code-format.test.ts`
Expected: FAIL — cannot resolve `lib/server/access-code-format`.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/server/access-code-format.ts
// One-time access code format. Alphabet drops 0/O and 1/I so codes can be
// read out over the phone or WhatsApp without ambiguity.
import { randomBytes } from "node:crypto";

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;

/** Uniform pick per char: 32 divides 256, so a byte mod 32 is unbiased. */
export function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/access-code-format.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/server/access-code-format.ts tests/v2/access-code-format.test.ts
git commit -m "feat(codes): code generator + normalize/format helpers"
```

---

### Task 3: Admin session tokens (pure)

**Files:**
- Create: `lib/server/admin-session.ts`
- Test: `tests/v2/admin-session.test.ts`

**Interfaces:**
- Produces:
  - `signSession(secret: string, now?: number): string` — token `"<expiryMs>.<hmacHex>"`, valid 12h.
  - `verifySession(token: string | undefined, secret: string, now?: number): boolean`.
  - `SESSION_COOKIE = "ss_admin"`.

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/v2/admin-session.test.ts
import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "../../lib/server/admin-session";

const SECRET = "test-secret";
const NOW = 1_700_000_000_000;

describe("admin session token", () => {
  it("round-trips: a signed token verifies", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, SECRET, NOW)).toBe(true);
  });

  it("expires after 12 hours", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, SECRET, NOW + 12 * 3600_000 - 1)).toBe(true);
    expect(verifySession(token, SECRET, NOW + 12 * 3600_000 + 1)).toBe(false);
  });

  it("rejects a tampered expiry", () => {
    const token = signSession(SECRET, NOW);
    const [, sig] = token.split(".");
    expect(verifySession(`${NOW + 999_999_999}.${sig}`, SECRET, NOW)).toBe(false);
  });

  it("rejects the wrong secret, garbage, and undefined", () => {
    const token = signSession(SECRET, NOW);
    expect(verifySession(token, "other-secret", NOW)).toBe(false);
    expect(verifySession("not-a-token", SECRET, NOW)).toBe(false);
    expect(verifySession(undefined, SECRET, NOW)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/v2/admin-session.test.ts`
Expected: FAIL — cannot resolve `lib/server/admin-session`.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/server/admin-session.ts
// Stateless admin session: "<expiryMs>.<hmacHex>" signed with ADMIN_SESSION_SECRET.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ss_admin";
const SESSION_TTL_MS = 12 * 3600_000;

function hmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signSession(secret: string, now: number = Date.now()): string {
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${hmac(exp, secret)}`;
}

export function verifySession(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < now) return false;
  const expected = hmac(exp, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/v2/admin-session.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/server/admin-session.ts tests/v2/admin-session.test.ts
git commit -m "feat(codes): HMAC-signed admin session tokens"
```

---

### Task 4: Code store — issue / list / revoke / redeem (injected client)

**Files:**
- Create: `lib/server/access-codes.ts`
- Create: `lib/server/supabase-admin.ts`
- Test: `tests/v2/access-codes.test.ts`

**Interfaces:**
- Consumes: `generateCode`, `normalizeCode` from Task 2.
- Produces (all take a `db: CodesDb` first arg so tests inject a stub):
  - `type StudentDetails = { name: string; email: string; phone: string; discipline: string; course: string | null; educationLevel: string }`
  - `type RedeemResult = { ok: true; studentId: string } | { ok: false; reason: "invalid_code" | "code_used" | "code_revoked" | "student_insert_failed" }`
  - `issueCode(db, label?: string): Promise<{ id: string; code: string }>`
  - `listCodes(db): Promise<CodeRow[]>` — newest first.
  - `revokeCode(db, id: string): Promise<boolean>`
  - `redeemCode(db, rawCode: string, student: StudentDetails): Promise<RedeemResult>`
  - `getSupabaseAdmin()` — real client from `SUPABASE_SERVICE_ROLE_KEY` (lazy, throws if env missing).
- `CodesDb` is a minimal interface (not the full supabase client) so the stub in tests is honest:

```typescript
export interface CodeRow {
  id: string; code: string; label: string | null;
  status: "active" | "used" | "revoked";
  created_at: string; used_at: string | null; used_by_student_id: string | null;
}
export interface CodesDb {
  insertCode(row: { code: string; label: string | null }): Promise<{ id: string }>;
  listCodes(): Promise<CodeRow[]>;
  /** UPDATE ... SET status='revoked' WHERE id=$1 AND status='active'; true if a row changed. */
  revokeActive(id: string): Promise<boolean>;
  /** UPDATE ... SET status='used', used_at=now() WHERE code=$1 AND status='active'; the claimed row's id, or null. */
  claimActive(code: string): Promise<{ id: string } | null>;
  findByCode(code: string): Promise<Pick<CodeRow, "status"> | null>;
  insertStudent(details: StudentDetails): Promise<{ id: string } | null>;
  attachStudent(codeId: string, studentId: string): Promise<void>;
  /** Compensating update: used → active, clears used_at (insert failed). */
  releaseCode(codeId: string): Promise<void>;
}
```

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/v2/access-codes.test.ts
import { describe, it, expect } from "vitest";
import {
  issueCode, listCodes, redeemCode, revokeCode,
  type CodesDb, type CodeRow, type StudentDetails,
} from "../../lib/server/access-codes";
import { CODE_ALPHABET, CODE_LENGTH } from "../../lib/server/access-code-format";

const STUDENT: StudentDetails = {
  name: "Riya", email: "riya@example.com", phone: "+91 99999 99999",
  discipline: "commerce", course: null, educationLevel: "college",
};

/** In-memory CodesDb faithful to the SQL semantics of each method. */
function memDb(seed: Partial<CodeRow>[] = []) {
  let nextId = 1;
  const rows: CodeRow[] = seed.map((s, i) => ({
    id: s.id ?? `c${i}`, code: s.code ?? `CODE${i}AAA`, label: s.label ?? null,
    status: s.status ?? "active", created_at: s.created_at ?? `2026-08-0${i + 1}`,
    used_at: null, used_by_student_id: null,
  }));
  const students: { id: string }[] = [];
  const db: CodesDb & { rows: CodeRow[]; failInsertStudent?: boolean } = {
    rows,
    async insertCode({ code, label }) {
      const row: CodeRow = {
        id: `c${nextId++}`, code, label, status: "active",
        created_at: new Date(2026, 7, 27).toISOString(), used_at: null, used_by_student_id: null,
      };
      rows.push(row);
      return { id: row.id };
    },
    async listCodes() { return [...rows].reverse(); },
    async revokeActive(id) {
      const r = rows.find((x) => x.id === id && x.status === "active");
      if (!r) return false;
      r.status = "revoked";
      return true;
    },
    async claimActive(code) {
      const r = rows.find((x) => x.code === code && x.status === "active");
      if (!r) return null;
      r.status = "used";
      r.used_at = "now";
      return { id: r.id };
    },
    async findByCode(code) {
      const r = rows.find((x) => x.code === code);
      return r ? { status: r.status } : null;
    },
    async insertStudent() {
      if (db.failInsertStudent) return null;
      const s = { id: `s${students.length + 1}` };
      students.push(s);
      return s;
    },
    async attachStudent(codeId, studentId) {
      const r = rows.find((x) => x.id === codeId);
      if (r) r.used_by_student_id = studentId;
    },
    async releaseCode(codeId) {
      const r = rows.find((x) => x.id === codeId);
      if (r) { r.status = "active"; r.used_at = null; }
    },
  };
  return db;
}

describe("issueCode", () => {
  it("stores a fresh well-formed code and returns it", async () => {
    const db = memDb();
    const { code } = await issueCode(db, "Riya, paid 26 Aug");
    expect(code).toHaveLength(CODE_LENGTH);
    for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    expect(db.rows[0].label).toBe("Riya, paid 26 Aug");
    expect(db.rows[0].status).toBe("active");
  });
});

describe("redeemCode", () => {
  it("consumes an active code, inserts the student, links the two", async () => {
    const db = memDb([{ code: "ABCD2345" }]);
    const result = await redeemCode(db, " abcd-2345 ", STUDENT); // messy input normalizes
    expect(result).toEqual({ ok: true, studentId: "s1" });
    expect(db.rows[0].status).toBe("used");
    expect(db.rows[0].used_by_student_id).toBe("s1");
  });

  it("second redemption of the same code fails with code_used", async () => {
    const db = memDb([{ code: "ABCD2345" }]);
    await redeemCode(db, "ABCD2345", STUDENT);
    const second = await redeemCode(db, "ABCD2345", STUDENT);
    expect(second).toEqual({ ok: false, reason: "code_used" });
  });

  it("unknown code fails with invalid_code", async () => {
    const db = memDb();
    expect(await redeemCode(db, "ZZZZ9999", STUDENT)).toEqual({ ok: false, reason: "invalid_code" });
  });

  it("revoked code fails with code_revoked", async () => {
    const db = memDb([{ code: "ABCD2345", status: "revoked" }]);
    expect(await redeemCode(db, "ABCD2345", STUDENT)).toEqual({ ok: false, reason: "code_revoked" });
  });

  it("releases the code back to active when the student insert fails", async () => {
    const db = memDb([{ code: "ABCD2345" }]);
    db.failInsertStudent = true;
    const result = await redeemCode(db, "ABCD2345", STUDENT);
    expect(result).toEqual({ ok: false, reason: "student_insert_failed" });
    expect(db.rows[0].status).toBe("active");
    expect(db.rows[0].used_at).toBeNull();
  });
});

describe("revokeCode / listCodes", () => {
  it("revokes only active codes", async () => {
    const db = memDb([{ id: "a1", code: "AAAA2222" }, { id: "u1", code: "BBBB3333", status: "used" }]);
    expect(await revokeCode(db, "a1")).toBe(true);
    expect(await revokeCode(db, "u1")).toBe(false);
    expect(db.rows[0].status).toBe("revoked");
  });

  it("listCodes returns newest first", async () => {
    const db = memDb([{ id: "old", code: "AAAA2222" }, { id: "new", code: "BBBB3333" }]);
    const list = await listCodes(db);
    expect(list.map((r) => r.id)).toEqual(["new", "old"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/v2/access-codes.test.ts`
Expected: FAIL — cannot resolve `lib/server/access-codes`.

- [ ] **Step 3: Write `lib/server/access-codes.ts`**

```typescript
// lib/server/access-codes.ts
// One-time access codes: issue, list, revoke, redeem. All functions take a
// CodesDb so tests can inject an in-memory double; production passes the
// supabase-backed implementation from supabase-admin.ts.
import { generateCode, normalizeCode } from "./access-code-format";

export interface CodeRow {
  id: string; code: string; label: string | null;
  status: "active" | "used" | "revoked";
  created_at: string; used_at: string | null; used_by_student_id: string | null;
}

export interface StudentDetails {
  name: string; email: string; phone: string;
  discipline: string; course: string | null; educationLevel: string;
}

export type RedeemResult =
  | { ok: true; studentId: string }
  | { ok: false; reason: "invalid_code" | "code_used" | "code_revoked" | "student_insert_failed" };

export interface CodesDb {
  insertCode(row: { code: string; label: string | null }): Promise<{ id: string }>;
  listCodes(): Promise<CodeRow[]>;
  revokeActive(id: string): Promise<boolean>;
  claimActive(code: string): Promise<{ id: string } | null>;
  findByCode(code: string): Promise<Pick<CodeRow, "status"> | null>;
  insertStudent(details: StudentDetails): Promise<{ id: string } | null>;
  attachStudent(codeId: string, studentId: string): Promise<void>;
  releaseCode(codeId: string): Promise<void>;
}

export async function issueCode(db: CodesDb, label?: string): Promise<{ id: string; code: string }> {
  const code = generateCode();
  const { id } = await db.insertCode({ code, label: label?.trim() || null });
  return { id, code };
}

export function listCodes(db: CodesDb): Promise<CodeRow[]> {
  return db.listCodes();
}

export function revokeCode(db: CodesDb, id: string): Promise<boolean> {
  return db.revokeActive(id);
}

export async function redeemCode(
  db: CodesDb,
  rawCode: string,
  student: StudentDetails,
): Promise<RedeemResult> {
  const code = normalizeCode(rawCode);
  const claimed = await db.claimActive(code);
  if (!claimed) {
    const existing = await db.findByCode(code);
    if (!existing) return { ok: false, reason: "invalid_code" };
    return { ok: false, reason: existing.status === "revoked" ? "code_revoked" : "code_used" };
  }
  const inserted = await db.insertStudent(student);
  if (!inserted) {
    await db.releaseCode(claimed.id); // give the buyer their code back
    return { ok: false, reason: "student_insert_failed" };
  }
  await db.attachStudent(claimed.id, inserted.id);
  return { ok: true, studentId: inserted.id };
}
```

- [ ] **Step 4: Write `lib/server/supabase-admin.ts`** (real CodesDb; no unit test — thin supabase mapping, covered by the manual E2E)

```typescript
// lib/server/supabase-admin.ts
// Service-role Supabase access. Server-only: never import from a client file.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CodeRow, CodesDb, StudentDetails } from "./access-codes";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function supabaseCodesDb(sb: SupabaseClient = getSupabaseAdmin()): CodesDb {
  return {
    async insertCode(row) {
      const { data, error } = await sb.from("access_codes").insert(row).select("id").single();
      if (error || !data) throw new Error(`insertCode failed: ${error?.message}`);
      return { id: data.id };
    },
    async listCodes() {
      const { data, error } = await sb
        .from("access_codes")
        .select("id, code, label, status, created_at, used_at, used_by_student_id")
        .order("created_at", { ascending: false });
      if (error) throw new Error(`listCodes failed: ${error.message}`);
      return (data ?? []) as CodeRow[];
    },
    async revokeActive(id) {
      const { data, error } = await sb
        .from("access_codes").update({ status: "revoked" })
        .eq("id", id).eq("status", "active").select("id");
      if (error) throw new Error(`revokeActive failed: ${error.message}`);
      return (data ?? []).length > 0;
    },
    async claimActive(code) {
      // Atomic one-time semantics: conditional UPDATE — of N racers, one gets the row.
      const { data, error } = await sb
        .from("access_codes")
        .update({ status: "used", used_at: new Date().toISOString() })
        .eq("code", code).eq("status", "active")
        .select("id");
      if (error) throw new Error(`claimActive failed: ${error.message}`);
      return data && data.length > 0 ? { id: data[0].id } : null;
    },
    async findByCode(code) {
      const { data } = await sb.from("access_codes").select("status").eq("code", code).maybeSingle();
      return (data as { status: CodeRow["status"] } | null) ?? null;
    },
    async insertStudent(d: StudentDetails) {
      const { data, error } = await sb
        .from("students")
        .insert({
          name: d.name, email: d.email, phone: d.phone,
          discipline: d.discipline, course_id: d.course, education_level: d.educationLevel,
        })
        .select("id").single();
      if (error || !data) return null;
      return { id: data.id };
    },
    async attachStudent(codeId, studentId) {
      await sb.from("access_codes").update({ used_by_student_id: studentId }).eq("id", codeId);
    },
    async releaseCode(codeId) {
      await sb.from("access_codes").update({ status: "active", used_at: null }).eq("id", codeId);
    },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/v2/access-codes.test.ts`
Expected: PASS (8 tests). Also run `npx tsc --noEmit` — clean.

- [ ] **Step 6: Commit**

```bash
git add lib/server/access-codes.ts lib/server/supabase-admin.ts tests/v2/access-codes.test.ts
git commit -m "feat(codes): issue/list/revoke/redeem with atomic claim + supabase-backed CodesDb"
```

---

### Task 5: API routes

**Files:**
- Create: `app/api/redeem/route.ts`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/codes/route.ts`
- Create: `app/api/admin/codes/revoke/route.ts`

**Interfaces:**
- Consumes: Task 2 `formatCode`; Task 3 `signSession`, `verifySession`, `SESSION_COOKIE`; Task 4 `issueCode`, `listCodes`, `revokeCode`, `redeemCode`, `supabaseCodesDb`.
- Produces (JSON contracts the UI tasks rely on):
  - `POST /api/redeem` → 200 `{ studentId }` | 400 `{ error: "missing_fields" }` | 403 `{ error: "invalid_code" | "code_used" | "code_revoked" }` | 500 `{ error: "student_insert_failed" }`.
  - `POST /api/admin/login` → 204 + cookie | 401 `{ error: "wrong_password" }`.
  - `GET /api/admin/codes` → 200 `{ codes: CodeRow[] }` | 401.
  - `POST /api/admin/codes` → 200 `{ id, code }` (code pre-formatted `XXXX-XXXX`) | 401.
  - `POST /api/admin/codes/revoke` → 204 | 401 | 404.

No unit tests for the handlers (thin wiring over Task 3/4 logic, which is tested); the manual E2E checklist in Task 8 covers them.

- [ ] **Step 1: Write `app/api/redeem/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { redeemCode, type StudentDetails } from "@/lib/server/access-codes";
import { supabaseCodesDb } from "@/lib/server/supabase-admin";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { code, name, email, phone, discipline, course, educationLevel } = body ?? {};
  if (
    typeof code !== "string" || !code.trim() ||
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof discipline !== "string" || typeof educationLevel !== "string"
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const student: StudentDetails = {
    name: name.trim(), email: email.trim(), phone: phone.trim(),
    discipline, course: typeof course === "string" && course ? course : null, educationLevel,
  };
  const result = await redeemCode(supabaseCodesDb(), code, student);
  if (!result.ok) {
    await sleep(400); // cheap brute-force damper
    const status = result.reason === "student_insert_failed" ? 500 : 403;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ studentId: result.studentId });
}
```

- [ ] **Step 2: Write `app/api/admin/login/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { SESSION_COOKIE, signSession } from "@/lib/server/admin-session";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) {
    return NextResponse.json({ error: "server_not_configured" }, { status: 500 });
  }
  if (password !== expected) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(SESSION_COOKIE, signSession(secret), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 12 * 3600,
  });
  return res;
}
```

- [ ] **Step 3: Write the shared guard and `app/api/admin/codes/route.ts`**

Next.js route files may only export HTTP verbs + config, so the guard lives in `lib/server/admin-guard.ts`:

```typescript
// lib/server/admin-guard.ts
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./admin-session";

export async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value, secret);
}
```

Then `app/api/admin/codes/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { formatCode } from "@/lib/server/access-code-format";
import { issueCode, listCodes } from "@/lib/server/access-codes";
import { supabaseCodesDb } from "@/lib/server/supabase-admin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const codes = await listCodes(supabaseCodesDb());
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { label } = (await req.json().catch(() => ({}))) as { label?: string };
  const { id, code } = await issueCode(supabaseCodesDb(), label);
  return NextResponse.json({ id, code: formatCode(code) });
}
```

- [ ] **Step 4: Write `app/api/admin/codes/revoke/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { revokeCode } from "@/lib/server/access-codes";
import { supabaseCodesDb } from "@/lib/server/supabase-admin";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const ok = await revokeCode(supabaseCodesDb(), id);
  if (!ok) return NextResponse.json({ error: "not_active" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit` and `npx vitest run`
Expected: both clean/green.

- [ ] **Step 6: Commit**

```bash
git add app/api/redeem app/api/admin lib/server/admin-guard.ts
git commit -m "feat(codes): redeem + admin login/codes/revoke API routes"
```

---

### Task 6: Landing page gate

**Files:**
- Modify: `app/page.tsx` — `handleStart` (lines ~40-75), `Form` props/fields (~200-290)

**Interfaces:**
- Consumes: `POST /api/redeem` contract from Task 5.
- Produces: registration flow that never touches Supabase from the browser.

- [ ] **Step 1: Add state and swap the submit handler**

In `LandingPage`, add alongside the existing `useState` calls:

```typescript
const [accessCode, setAccessCode] = useState("");
const [codeError, setCodeError] = useState<string | null>(null);
```

Replace the body of `handleStart` (keep the signature) with:

```typescript
const handleStart = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim() || !email.trim() || !phone.trim() || !accessCode.trim()) return;
  if (existingProfile) reset();

  setSubmitting(true);
  setCodeError(null);

  const res = await fetch("/api/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: accessCode, name, email, phone, discipline,
      course: course ?? null, educationLevel: educationLevel ?? "college",
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    const reason = res ? (await res.json().catch(() => ({}))).error : "network";
    setCodeError(
      reason === "invalid_code" ? "That code isn't recognized — check for typos."
      : reason === "code_used" ? "This code has already been used."
      : reason === "code_revoked" ? "This code was cancelled. Contact Secure Steps."
      : "Something went wrong — please try again.",
    );
    setSubmitting(false);
    return;
  }

  const { studentId } = await res.json();
  setProfile({
    name: name.trim(), email: email.trim(), phone: phone.trim(),
    educationLevel, discipline, course, studentId,
  });
  setSubmitting(false);
  router.push("/assessment");
};
```

Remove the now-unused `import { supabase } from "@/lib/supabase";` from this file.

- [ ] **Step 2: Add the field to `Form`**

Pass `accessCode`, `setAccessCode`, `codeError` through `<Form …>` props (add them to the prop list and its TypeScript type the same way `phone`/`setPhone` are passed). Under the PHONE `Field`, add:

```tsx
<Field label="SECURITY CODE" required>
  <input type="text" value={props.accessCode}
    onChange={(e) => props.setAccessCode(e.target.value.toUpperCase())}
    placeholder="XXXX-XXXX" autoCapitalize="characters" autoComplete="off"
    className="w-full rounded-xl px-4 py-3 text-[15px] font-mono tracking-[0.15em] text-ink placeholder:text-ink-300 outline-none transition-all"
    style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
  {props.codeError && (
    <p className="mt-2 text-[13px] text-red-600">{props.codeError}</p>
  )}
</Field>
```

Update the submit button's `disabled` condition to also require `props.accessCode.trim()`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — clean. `npm run dev`, load `/`: the form shows the SECURITY CODE field, and submitting garbage shows the "isn't recognized" error (requires the migration + env vars from Task 8; if not yet configured, the generic error appearing is the expected observable).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(codes): landing form requires a one-time security code, registration moves server-side"
```

---

### Task 7: Admin dashboard

**Files:**
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: Task 5 admin API contracts.

- [ ] **Step 1: Write the page** (client component; auth probe = `GET /api/admin/codes`, 401 → login form)

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Plus, Ban, RefreshCw } from "lucide-react";

interface CodeRow {
  id: string; code: string; label: string | null;
  status: "active" | "used" | "revoked";
  created_at: string; used_at: string | null; used_by_student_id: string | null;
}

const fmt = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;
const dateFmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_STYLES: Record<CodeRow["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  used: "bg-slate-200 text-slate-600",
  revoked: "bg-red-100 text-red-600",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = probing
  const [codes, setCodes] = useState<CodeRow[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/codes").catch(() => null);
    if (!res || res.status === 401) { setAuthed(false); return; }
    setCodes((await res.json()).codes);
    setAuthed(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (authed === null) return <main className="min-h-dvh bg-[#f7e8ee]" />;
  return (
    <main className="min-h-dvh bg-[#f7e8ee] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="font-mono text-[13px] font-semibold tracking-wide uppercase">Secure Steps · Access Codes</h1>
          {authed && (
            <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/60" title="Refresh">
              <RefreshCw className="size-4" />
            </button>
          )}
        </header>
        {authed ? <Dashboard codes={codes} onChanged={refresh} /> : <Login onSuccess={refresh} />}
      </div>
    </main>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.status === 204) onSuccess();
    else setError(true);
  };

  return (
    <form onSubmit={submit} className="bg-white/70 rounded-2xl p-6 space-y-4 max-w-sm">
      <div className="mono-eyebrow text-ink-700">ADMIN PASSWORD</div>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-3 text-[15px] outline-none" autoFocus />
      {error && <p className="text-[13px] text-red-600">Wrong password.</p>}
      <button type="submit" disabled={!password || busy}
        className="w-full py-3 rounded-xl bg-ink text-white font-mono text-[13px] uppercase tracking-wider disabled:opacity-40">
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

function Dashboard({ codes, onChanged }: { codes: CodeRow[]; onChanged: () => void }) {
  const [label, setLabel] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/codes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return;
    const { code } = await res.json();
    setFresh(code); setLabel(""); setCopied(false);
    onChanged();
  };

  const revoke = async (id: string) => {
    await fetch("/api/admin/codes/revoke", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    onChanged();
  };

  const copy = async () => {
    if (!fresh) return;
    await navigator.clipboard.writeText(fresh).catch(() => {});
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 rounded-2xl p-6 space-y-4">
        <div className="mono-eyebrow text-ink-700">GENERATE A CODE</div>
        <div className="flex gap-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional) — e.g. Riya, paid 26 Aug UPI"
            className="flex-1 rounded-xl border border-line px-4 py-3 text-[14px] outline-none" />
          <button onClick={generate} disabled={busy}
            className="px-5 rounded-xl bg-ink text-white font-mono text-[13px] uppercase tracking-wider flex items-center gap-2 disabled:opacity-40">
            <Plus className="size-4" /> {busy ? "…" : "Generate"}
          </button>
        </div>
        {fresh && (
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <span className="font-mono text-[26px] font-black tracking-[0.2em]">{fresh}</span>
            <button onClick={copy} className="p-2 rounded-lg hover:bg-emerald-100" title="Copy">
              {copied ? <Check className="size-5 text-emerald-600" /> : <Copy className="size-5" />}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/70 rounded-2xl p-6 overflow-x-auto">
        <div className="mono-eyebrow text-ink-700 mb-4">ALL CODES · {codes.length}</div>
        <table className="w-full text-[13px]">
          <thead className="text-left text-ink-400 font-mono uppercase text-[11px]">
            <tr><th className="py-2 pr-4">Code</th><th className="pr-4">Label</th><th className="pr-4">Status</th><th className="pr-4">Created</th><th className="pr-4">Used</th><th /></tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-t border-line/50">
                <td className="py-2.5 pr-4 font-mono font-bold tracking-wider">{fmt(c.code)}</td>
                <td className="pr-4 text-ink-600">{c.label ?? "—"}</td>
                <td className="pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                </td>
                <td className="pr-4 text-ink-400">{dateFmt(c.created_at)}</td>
                <td className="pr-4 text-ink-400">{dateFmt(c.used_at)}</td>
                <td>
                  {c.status === "active" && (
                    <button onClick={() => revoke(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Revoke">
                      <Ban className="size-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-ink-400">No codes yet — generate the first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — clean. With env vars set and dev server running: `/admin` shows login; wrong password errors; right password shows dashboard.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(codes): admin dashboard — login, generate with label, code table, revoke"
```

---

### Task 8: Env template, operator doc, E2E checklist

**Files:**
- Create or modify: `.env.example` (create if absent)
- Create: `docs/access-codes-how-it-works.md`

**Interfaces:** none — documentation and configuration.

- [ ] **Step 1: Add env template entries**

Append to `.env.example` (create the file if it doesn't exist):

```bash
# --- Access codes (server-only; never expose with NEXT_PUBLIC_) ---
# Supabase → Project Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=
# Password for /admin (pick a long one)
ADMIN_PASSWORD=
# Random secret for signing admin session cookies, e.g.: openssl rand -hex 32
ADMIN_SESSION_SECRET=
```

- [ ] **Step 2: Write the operator doc** — `docs/access-codes-how-it-works.md`, plain language, covering: what the system does; one-time setup (run the migration in Supabase SQL editor, set the three env vars locally and on the host); daily flow (open `/admin`, log in, generate with a label, copy, send to the buyer, student enters it on the landing page); what each status means; how to revoke; what students see on errors; the exact future seams (payment webhook → `issueCode()`, email delivery → beside `issueCode()`). Write it fresh from the spec — it is the user-facing deliverable, not a copy of the spec.

- [ ] **Step 3: Run the manual E2E checklist** (needs migration run + env vars in `.env.local`)

1. `npm run dev`, open `/admin` → login form; wrong password → "Wrong password."
2. Log in → dashboard; generate a code with label "e2e test" → code shows `XXXX-XXXX`, copy works, table row `active`.
3. Landing page: fill details + the code → enters `/assessment`; dashboard row flips to `used` with a timestamp.
4. Same code again on the landing page (fresh browser/incognito, since the store persists) → "This code has already been used."
5. Generate second code → revoke it → landing page with it → "This code was cancelled."
6. Garbage code → "That code isn't recognized."

- [ ] **Step 4: Full verification**

Run: `npx vitest run` and `npx tsc --noEmit`
Expected: all green, clean.

- [ ] **Step 5: Commit**

```bash
git add .env.example docs/access-codes-how-it-works.md
git commit -m "docs(codes): operator guide + env template"
```
