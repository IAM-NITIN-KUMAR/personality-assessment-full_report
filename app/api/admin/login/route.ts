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
