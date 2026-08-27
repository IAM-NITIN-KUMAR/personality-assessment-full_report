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
    try {
      await db.releaseCode(claimed.id); // give the buyer their code back
    } catch (err) {
      console.error("releaseCode failed (code stuck 'used', reactivate manually):", err);
    }
    return { ok: false, reason: "student_insert_failed" };
  }
  try {
    await db.attachStudent(claimed.id, inserted.id);
  } catch (err) {
    console.error("attachStudent failed (code linked manually later):", err);
  }
  return { ok: true, studentId: inserted.id };
}
