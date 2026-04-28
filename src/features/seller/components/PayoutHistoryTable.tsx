import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function PayoutHistoryTable() {
  const payouts = [
    {
      id: "PAYOUT-001",
      amount: 1250.0,
      date: "2024-10-15",
      status: "completed",
      method: "Bank Transfer",
    },
    {
      id: "PAYOUT-002",
      amount: 890.5,
      date: "2024-09-28",
      status: "completed",
      method: "Stripe",
    },
    {
      id: "PAYOUT-003",
      amount: 2100.0,
      date: "2024-09-10",
      status: "pending",
      method: "Bank Transfer",
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payout ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => (
          <TableRow key={payout.id}>
            <TableCell className="font-mono text-sm">{payout.id}</TableCell>
            <TableCell>${payout.amount.toFixed(2)}</TableCell>
            <TableCell>{new Date(payout.date).toLocaleDateString("en-US")}</TableCell>
            <TableCell>{payout.method}</TableCell>
            <TableCell>
              <Badge
                variant={
                  payout.status === "completed" ? "default" : "secondary"
                }
              >
                {payout.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
