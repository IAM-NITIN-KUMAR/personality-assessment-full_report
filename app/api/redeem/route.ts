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
