import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./admin-session";

export async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value, secret);
}
