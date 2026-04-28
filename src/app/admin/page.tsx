import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    href: "/admin/users",
    title: "User Management",
    description: "Approve, restrict, or manage user accounts",
    icon: Users,
    color: "text-blue-600",
  },
  {
    href: "/admin/products",
    title: "Products",
    description: "Manage product listings and inventory",
    icon: Package,
    color: "text-green-600",
  },
  {
    href: "/admin/orders",
    title: "Orders",
    description: "Track and update order status",
    icon: ShoppingCart,
    color: "text-purple-600",
  },
  {
    href: "/admin/promos",
    title: "Promo Codes",
    description: "Create and manage discount campaigns",
    icon: FileText,
    color: "text-orange-600",
  },
];

const stats = [
  { label: "Total Users", value: "—", trend: "+0%", icon: Users },
  { label: "Active Products", value: "—", trend: "0", icon: Package },
  { label: "Pending Orders", value: "—", trend: "0", icon: ShoppingCart },
  { label: "Revenue (30d)", value: "$0.00", trend: "+0%", icon: TrendingUp },
];

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your e-commerce platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.icon}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.trend} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <link.icon className={`h-5 w-5 ${link.color} mb-2`} />
                  <CardTitle className="text-base">{link.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Activity feed will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
