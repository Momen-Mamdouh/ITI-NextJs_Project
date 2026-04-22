import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/seller", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/products", icon: Package, label: "Products" },
  { href: "/seller/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/seller/earnings", icon: Wallet, label: "Earnings" },
  { href: "/seller/profile", icon: Settings, label: "Profile" },
];

export function SellerSidebar() {
  return (
    <aside className="w-64 bg-background border-r h-screen sticky top-0 p-4">
      <div className="font-bold text-xl mb-6 px-2">Vendor Portal</div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
