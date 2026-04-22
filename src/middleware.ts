import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl;
  // const accessToken = request.cookies.get("access_token")?.value;
  // const refreshToken = request.cookies.get("refresh_token")?.value;

  // const isAuthRoute = pathname.startsWith("/auth");
  // const isAdminRoute = pathname.startsWith("/admin");
  // const isSellerRoute = pathname.startsWith("/seller");
  // const isAccountRoute = pathname.startsWith("/account");

  // if (isAuthRoute && accessToken) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // if (isAdminRoute || isSellerRoute || isAccountRoute) {
  //   if (!accessToken) {
  //     return NextResponse.redirect(new URL("/auth/login", request.url));
  //   }
  //   const session = await verifyToken(accessToken);
  //   if (!session) {
  //     if (refreshToken) {
  //       const response = NextResponse.next();
  //       response.cookies.set("refresh_redirect", pathname, {
  //         maxAge: 300,
  //         path: "/",
  //       });
  //       return response;
  //     }
  //     return NextResponse.redirect(new URL("/auth/login", request.url));
  //   }
  //   if (isAdminRoute && session.role !== "admin") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  //   if (
  //     isSellerRoute &&
  //     session.role !== "seller" &&
  //     session.role !== "admin"
  //   ) {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin/:path*",
    "/seller/:path*",
    "/account/:path*",
  ],
};
