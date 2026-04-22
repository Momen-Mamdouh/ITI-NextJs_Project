import { fetchSellerEarnings } from "@/features/seller/seller-earnings-actions";
import { EarningsOverview } from "@/features/seller/components/EarningsOverview";
import { WithdrawalForm } from "@/features/seller/components/WithdrawalForm";
import { PayoutHistoryTable } from "@/features/seller/components/PayoutHistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SellerEarningsPage() {
  const result = await fetchSellerEarnings();

  if (!result.success) {
    return <div className="p-6 text-destructive">Failed to load earnings</div>;
  }

  const data = result.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Earnings & Payouts</h2>

      <EarningsOverview data={data} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <WithdrawalForm availableBalance={data?.availableBalance || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <PayoutHistoryTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
