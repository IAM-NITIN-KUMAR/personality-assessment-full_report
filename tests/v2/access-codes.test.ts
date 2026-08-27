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
