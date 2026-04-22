import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, Wallet } from "lucide-react";

interface EarningsOverviewProps {
  data: {
    totalEarnings: number;
    pendingAmount: number;
    availableBalance: number;
  };
}

export function EarningsOverview({ data }: EarningsOverviewProps) {
  const stats = [
    { label: "Total Earnings", value: data.totalEarnings, icon: TrendingUp },
    {
      label: "Available Balance",
      value: data.availableBalance,
      icon: Wallet,
      highlight: true,
    },
    { label: "Pending Payouts", value: data.pendingAmount, icon: Clock },
    { label: "Platform Fees", value: 0, icon: DollarSign },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={stat.highlight ? "border-primary" : ""}
        >
          <CardContent className="p-6 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{stat.label}</span>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">${stat.value.toFixed(2)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
