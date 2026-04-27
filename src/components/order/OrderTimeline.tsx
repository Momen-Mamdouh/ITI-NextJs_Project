"use client";

import { CheckCircle2, Circle, Package, Truck, MapPin, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusEntry {
  status: string;
  note?: string;
  createdAt: string;
}

const STATUS_ORDER = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
] as const;

const STATUS_META: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pending: { label: "Order Placed", icon: Circle, color: "text-yellow-500" },
  paid: { label: "Payment Confirmed", icon: CheckCircle2, color: "text-green-600" },
  processing: { label: "Processing", icon: Package, color: "text-blue-500" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-500" },
  delivered: { label: "Delivered", icon: MapPin, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: Ban, color: "text-red-500" },
  refunded: { label: "Refunded", icon: Ban, color: "text-gray-500" },
};

export function OrderTimeline({
  statusHistory,
  currentStatus,
  trackingNumber,
  carrier,
}: {
  statusHistory: StatusEntry[];
  currentStatus: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  const isCancelledOrRefunded = currentStatus === "cancelled" || currentStatus === "refunded";

  const reachedStatuses = new Set(statusHistory.map((s) => s.status));
  reachedStatuses.add(currentStatus);

  const timeline = isCancelledOrRefunded
    ? statusHistory
    : STATUS_ORDER.map((status) => {
        const entry = statusHistory.find((h) => h.status === status);
        return {
          status,
          note: entry?.note,
          createdAt: entry?.createdAt || "",
          reached: reachedStatuses.has(status),
        };
      });

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold mb-3">Order Tracking</h3>

      {trackingNumber && (
        <div className="rounded-md bg-muted/50 border px-3 py-2 mb-4 text-sm">
          <span className="font-medium">Tracking:</span> {trackingNumber}
          {carrier && <span className="text-muted-foreground"> via {carrier}</span>}
        </div>
      )}

      <ol className="relative border-l-2 border-muted ml-3 space-y-0">
        {timeline.map((entry, i) => {
          const status = "status" in entry ? entry.status : "";
          const meta = STATUS_META[status] || STATUS_META.pending;
          const Icon = meta.icon;
          const reached = "reached" in entry ? entry.reached : true;

          return (
            <li key={i} className="ml-6 pb-6 last:pb-0 relative">
              <span
                className={cn(
                  "absolute left-[-31px] flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background",
                  reached ? meta.color : "text-muted-foreground/40",
                  reached ? "border-current" : "border-muted",
                )}
              >
                <Icon className="h-3 w-3" />
              </span>

              <div className={cn(!reached && "opacity-40")}>
                <p className="text-sm font-medium">{meta.label}</p>
                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                )}
                {entry.createdAt && (
                  <time className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </time>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
