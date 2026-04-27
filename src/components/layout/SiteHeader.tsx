"use client";

import Link from "next/link";
import { ShoppingCart, User, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { Logo } from "@/shared/components/Logo";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { itemCount, isHydrated, user } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6 md:gap-10">
          <Link href="/" className="shrink-0">
            <Logo className="h-6" />
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            {user?.role === "customer" && (
              <Link
                href="/account"
                className="hover:text-foreground transition-colors"
              >
                My account
              </Link>
            )}
            {user && (user.role === "seller" || user.role === "admin") && (
              <Link
                href={user.role === "admin" ? "/admin" : "/seller"}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Store className="size-4" />
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(!user || user.role === "customer") && (
            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "relative inline-flex gap-1.5",
              )}
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {isHydrated && itemCount > 0 && (
                <Badge
                  variant="default"
                  className="ms-0.5 h-5 min-w-5 px-1 text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Link>
          )}

          {!user && (
            <>
              <Link
                href="/auth/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className={buttonVariants({ size: "sm" })}
              >
                Register
              </Link>
            </>
          )}

          {user && user.role === "customer" && (
            <Link
              href="/account/profile"
              title="Account"
              className={buttonVariants({
                variant: "ghost",
                size: "icon-sm",
              })}
            >
              <User className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
