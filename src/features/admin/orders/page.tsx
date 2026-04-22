import { fetchOrders } from "@/features/orders/order-actions";
import { OrderTable } from "@/features/admin/components/OrderTable";

export default async function OrdersPage() {
  const result = await fetchOrders();
  if (!result.success)
    return <div className="p-6 text-destructive">Failed to load orders</div>;
  return <OrderTable orders={result.data || []} />;
}
