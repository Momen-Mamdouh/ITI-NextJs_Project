"use client";

import Link from "next/link";
import { ShoppingCart, User, Store, LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { Logo } from "@/shared/components/Logo";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/features/auth/actions";

export function SiteHeader() {
  const { itemCount, isHydrated, user } = useCart();

  const router = useRouter();
  const handleSignOut = async () => {
    await logoutUser();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="text-foreground" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          {user?.role === "customer" && (
            <Link
              href="/account"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Account
            </Link>
          )}
          {user && (user.role === "seller" || user.role === "admin") && (
            <Link
              href={user.role === "admin" ? "/admin" : "/seller"}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="ghost" size="icon-sm" />

          {(!user || user.role === "customer") && (
            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "relative inline-flex gap-1.5 btn-interactive",
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {isHydrated && itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Link>
          )}

          {!user ? (
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
          ) : user.role === "customer" ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="btn-interactive"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/account/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/account/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/account/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/api/auth/logout">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={user.role === "admin" ? "/admin" : "/seller"}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1 btn-interactive",
              )}
            >
              <Store className="h-4 w-4" />
              {user.role === "admin" ? "Admin" : "Seller"}
            </Link>
          )}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
}
