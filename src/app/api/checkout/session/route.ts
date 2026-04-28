import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/token";
import dbConnect from "@/lib/db";
import UserModel from "@/features/user/models/user.model";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ addresses: [] });

  const session = await verifyToken(token);
  if (!session?.id || session.role !== "customer") {
    return NextResponse.json({ addresses: [] });
  }

  await dbConnect();
  const user = await UserModel.findById(session.id)
    .select("addresses")
    .lean();

  const addresses = user?.addresses ?? [];
  return NextResponse.json({
    addresses: JSON.parse(JSON.stringify(addresses)),
  });
}
