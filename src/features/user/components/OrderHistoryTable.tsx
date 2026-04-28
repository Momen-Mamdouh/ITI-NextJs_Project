"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  discount: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

interface OrderHistoryTableProps {
  orders: Order[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export function OrderHistoryTable({
  orders,
  pagination,
}: OrderHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
        <ShoppingBag className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your order history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-mono text-xs">
                #{order._id.slice(-8)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-US")}
              </TableCell>
              <TableCell>{order.items.length} item(s)</TableCell>
              <TableCell className="font-medium">
                ${order.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status] || "outline"}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "outline"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/account/orders/${order._id}`}>
                  <Button size="icon-sm" variant="ghost">
                    <Eye className="size-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            orders)
          </p>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link href={`/account/orders?page=${pagination.page - 1}`}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link href={`/account/orders?page=${pagination.page + 1}`}>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
