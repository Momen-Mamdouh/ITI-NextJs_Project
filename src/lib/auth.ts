import "server-only";
import { cookies } from "next/headers";

export {
  AuthSchema,
  LoginSchema,
  RegisterSchema,
  hashPassword,
  verifyPassword,
} from "@/lib/auth-schemas";

export { createTokens, verifyToken, getDevSession } from "@/lib/token";

import { createTokens, verifyToken } from "@/lib/token";

export async function setSessionCookies(access: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 900,
    path: "/",
  });
  cookieStore.set("refresh_token", refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 604800,
    path: "/",
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function requireAuth(allowedRoles?: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const session = await verifyToken(token);
  if (!session) throw new Error("Unauthorized");
  if (allowedRoles && !allowedRoles.includes(session.role))
    throw new Error("Forbidden");
  return session;
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;
  if (!refresh) throw new Error("Unauthorized");
  const payload = await verifyToken(refresh);
  if (!payload?.id) throw new Error("Unauthorized");
  const newTokens = await createTokens({
    id: payload.id as string,
    role: payload.role as string,
  });
  await setSessionCookies(newTokens.access, newTokens.refresh);
  return { access: newTokens.access };
}
