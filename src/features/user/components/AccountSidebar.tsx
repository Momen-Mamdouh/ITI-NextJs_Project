"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Heart,
  ShoppingBag,
  Star,
  MapPin,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/actions";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/orders", label: "Order History", icon: ShoppingBag },
  { href: "/account/reviews", label: "My Reviews", icon: Star },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
