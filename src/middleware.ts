import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute = pathname.startsWith("/seller");
  const isAccountRoute = pathname.startsWith("/account");
  const isApiRoute = pathname.startsWith("/api");

  const nextParamRaw = request.nextUrl.searchParams.get("next");
  const safeNext =
    nextParamRaw && nextParamRaw.startsWith("/") && !nextParamRaw.startsWith("//")
      ? nextParamRaw
      : null;

  if (isAuthRoute && accessToken) {
    const session = await verifyToken(accessToken);
    if (session) {
      return NextResponse.redirect(
        new URL(
          session.role === "admin"
            ? "/admin"
            : session.role === "seller"
              ? "/seller"
              : safeNext || "/",
          request.url,
        ),
      );
    }
  }

  // If an admin tries to access any non-admin page, send them to /admin.
  if (!isAuthRoute && !isAdminRoute && !isApiRoute && accessToken) {
    const session = await verifyToken(accessToken);
    if (session?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session?.role === "seller" && !isSellerRoute) {
      return NextResponse.redirect(new URL("/seller", request.url));
    }
  }

  if (isAdminRoute || isSellerRoute || isAccountRoute) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const session = await verifyToken(accessToken);
    if (!session) {
      const refreshToken = request.cookies.get("refresh_token")?.value;
      if (refreshToken) {
        const response = NextResponse.next();
        response.cookies.set("refresh_redirect", pathname, {
          maxAge: 300,
          path: "/",
        });
        return response;
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (isAdminRoute && session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      isSellerRoute &&
      session.role !== "seller" &&
      session.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
