import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
  const stats = [
    { title: "Total Revenue", value: "$0.00", icon: DollarSign, trend: "+0%" },
    { title: "Active Products", value: "0", icon: Package, trend: "0" },
    { title: "Pending Orders", value: "0", icon: ShoppingCart, trend: "0" },
    { title: "Conversion Rate", value: "0%", icon: TrendingUp, trend: "0%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
