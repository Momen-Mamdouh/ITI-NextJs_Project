import { getOrderHistory } from "@/features/user/actions";
import { OrderHistoryTable } from "@/features/user/components/OrderHistoryTable";

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getOrderHistory(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your orders
        </p>
      </div>
      <OrderHistoryTable
        orders={result.orders || []}
        pagination={result.pagination}
      />
    </div>
  );
}
