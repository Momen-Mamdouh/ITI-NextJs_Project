"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { OrderStatusForm } from "./OrderStatusForm";

interface OrderDoc {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: { fullName: string; city: string };
}

export function OrderTable({ orders }: { orders: OrderDoc[] }) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const router = useRouter();

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <input
          type="text"
          placeholder="Search by ID or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm max-w-xs"
        />
      </div>
      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-sm">
                  {order._id.slice(-8)}
                </TableCell>
                <TableCell>
                  {order.shippingAddress?.fullName || "N/A"}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusClass(order.status)}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.paymentStatus === "paid" ? "default" : "secondary"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          Update Order #{order._id.slice(-8)}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <OrderStatusForm
                          order={selectedOrder}
                          onSuccess={() => router.refresh()}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
