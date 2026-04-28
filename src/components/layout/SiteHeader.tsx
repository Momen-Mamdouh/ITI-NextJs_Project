"use client";

import Link from "next/link";
import { ShoppingCart, User, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { Logo } from "@/shared/components/Logo";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/features/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function SiteHeader() {
  const { itemCount, isHydrated, user } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logoutUser();
    router.push("/auth/login");
    router.refresh();
  };

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/seller")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Logo className="text-foreground" />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="ghost" size="icon-sm" />

          {(!user || user.role === "customer") && (
            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "relative inline-flex gap-1.5 btn-interactive no-underline",
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {isHydrated && itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-3 h-5 min-w-5 px-1 text-xs"
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
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "no-underline",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className={cn(buttonVariants({ size: "sm" }), "no-underline")}
              >
                Register
              </Link>
            </>
          ) : user.role === "customer" ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className={cn(
                  "inline-flex items-center justify-center rounded-lg transition-all outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "hover:bg-muted disabled:opacity-50",
                  "size-7", // matches icon-sm
                )}
              >
                <User className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/account/profile" className="no-underline">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/account/orders" className="no-underline">
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/account/wishlist" className="no-underline">
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left"
                  >
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={user.role === "admin" ? "/admin" : "/seller"}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1 btn-interactive no-underline",
              )}
            >
              <Store className="h-4 w-4" />
              {user.role === "admin" ? "Admin" : "Seller"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
