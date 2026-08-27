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
