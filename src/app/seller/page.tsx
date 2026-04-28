import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SellerModel from "@/features/seller/models/seller.model";
import ProductModel from "@/features/products/models/product.model";
import OrderModel from "@/features/orders/models/order.model";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function SellerDashboard() {
  const session = await requireAuth(["seller"]);
  await dbConnect();

  const seller = await SellerModel.findOne({ userId: session.id })
    .select("_id")
    .lean();
  const sellerId = seller?._id;

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [activeProducts, pendingOrders, revenueAgg] = await Promise.all([
    sellerId
      ? ProductModel.countDocuments({ sellerId, isActive: true })
      : Promise.resolve(0),
    sellerId
      ? OrderModel.countDocuments({
          status: "pending",
          "items.sellerId": sellerId,
        })
      : Promise.resolve(0),
    sellerId
      ? OrderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: since },
              paymentStatus: "paid",
              "items.sellerId": sellerId,
            },
          },
          { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
        ])
      : Promise.resolve([] as { revenue?: number }[]),
  ]);

  const revenue30d = Number(revenueAgg?.[0]?.revenue ?? 0);
  const stats = [
    {
      title: "Revenue (30d)",
      value: `$${revenue30d.toFixed(2)}`,
      icon: DollarSign,
      trend: "",
    },
    {
      title: "Active Products",
      value: String(activeProducts),
      icon: Package,
      trend: "",
    },
    {
      title: "Pending Orders",
      value: String(pendingOrders),
      icon: ShoppingCart,
      trend: "",
    },
    { title: "Conversion Rate", value: "—", icon: TrendingUp, trend: "" },
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
              {stat.trend ? (
                <p className="text-xs text-muted-foreground">
                  {stat.trend} from last month
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
