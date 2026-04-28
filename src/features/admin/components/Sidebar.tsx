"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logoutUser } from "@/features/auth/actions";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/promos", icon: FileText, label: "Promos" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignOut = async () => {
    await logoutUser();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col theme-transition">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              Admin Panel
            </h1>
            <p className="text-xs text-sidebar-foreground/70">
              Manage your platform
            </p>
          </div>
          <ThemeToggle variant="ghost" size="icon-sm" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                "hover:bg-sidebar-accent hover:bg-opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                "transition-all duration-200 ease-in-out",
                "active:scale-[0.98]",
                isActive && [
                  "bg-sidebar-accent text-sidebar-foreground font-semibold",
                  "border-l-2 border-sidebar-primary pl-2.5",
                  "shadow-sm",
                ],
                !isActive && "hover:translate-x-0.5",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isActive ? "text-sidebar-primary" : "group-hover:scale-110",
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>System operational</span>
        </div>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
