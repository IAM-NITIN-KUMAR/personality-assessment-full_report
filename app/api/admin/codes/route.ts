import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { formatCode } from "@/lib/server/access-code-format";
import { issueCode, listCodes } from "@/lib/server/access-codes";
import { supabaseCodesDb } from "@/lib/server/supabase-admin";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const codes = await listCodes(supabaseCodesDb());
    return NextResponse.json({ codes });
  } catch (err) {
    console.error("list codes failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { label } = (await req.json().catch(() => ({}))) as { label?: string };
  try {
    const { id, code } = await issueCode(supabaseCodesDb(), label);
    return NextResponse.json({ id, code: formatCode(code) });
  } catch (err) {
    console.error("issue code failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
