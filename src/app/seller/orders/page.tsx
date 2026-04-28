import { fetchSellerOrders } from "@/features/seller/seller-order-actions";
import { SellerOrderTable } from "@/features/seller/components/SellerOrderTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const result = await fetchSellerOrders();
  if (!result.success)
    return <div className="p-6 text-destructive">Failed to load orders</div>;
  return <SellerOrderTable orders={result.data || []} />;
}
