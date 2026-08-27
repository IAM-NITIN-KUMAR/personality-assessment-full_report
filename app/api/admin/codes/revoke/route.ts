import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { revokeCode } from "@/lib/server/access-codes";
import { supabaseCodesDb } from "@/lib/server/supabase-admin";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  try {
    const ok = await revokeCode(supabaseCodesDb(), id);
    if (!ok) return NextResponse.json({ error: "not_active" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("revoke code failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
