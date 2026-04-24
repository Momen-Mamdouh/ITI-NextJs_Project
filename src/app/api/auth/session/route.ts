import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/token";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  const session = await verifyToken(token);
  if (!session || !("id" in session) || !("role" in session)) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: String(session.id),
      role: session.role,
    },
  });
}
