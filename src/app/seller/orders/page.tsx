import { fetchSellerOrders } from "@/features/seller/seller-order-actions";
import { SellerOrderTable } from "@/features/seller/components/SellerOrderTable";

export default async function SellerOrdersPage() {
  const result = await fetchSellerOrders();
  if (!result.success)
    return <div className="p-6 text-destructive">Failed to load orders</div>;
  return <SellerOrderTable orders={result.data || []} />;
}
