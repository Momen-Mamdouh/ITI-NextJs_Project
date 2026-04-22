import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", "http://localhost:3000"));

  res.cookies.set("access_token", "fake_access", {
    path: "/",
  });

  res.cookies.set("refresh_token", "fake_refresh", {
    path: "/",
  });

  return res;
}
