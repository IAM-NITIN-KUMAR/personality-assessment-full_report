import "server-only";
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
      const { data, error } = await sb.from("access_codes").select("status").eq("code", code).maybeSingle();
      if (error) throw new Error(`findByCode failed: ${error.message}`);
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
      const { error } = await sb.from("access_codes").update({ used_by_student_id: studentId }).eq("id", codeId);
      if (error) throw new Error(`attachStudent failed: ${error.message}`);
    },
    async releaseCode(codeId) {
      const { error } = await sb.from("access_codes").update({ status: "active", used_at: null }).eq("id", codeId);
      if (error) throw new Error(`releaseCode failed: ${error.message}`);
    },
  };
}
