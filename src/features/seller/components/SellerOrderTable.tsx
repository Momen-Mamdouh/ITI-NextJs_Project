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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle } from "lucide-react";
import { SellerOrderStatusForm } from "./SellerOrderStatusForm";

interface OrderDoc {
  _id: string;
  totalAmount: number;
  status: string;
  items: Array<{ name: string; quantity: number }>;
  createdAt: string;
}

export function SellerOrderTable({ orders }: { orders: OrderDoc[] }) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDoc | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const router = useRouter();

  const filtered = orders.filter((o) =>
    o._id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <input
          type="text"
          placeholder="Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>
      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-sm">
                  {order._id.slice(-8)}
                </TableCell>
                <TableCell>{order.items.length} item(s)</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "shipped"
                        ? "default"
                        : order.status === "delivered"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.status === "delivered" ? (
                    <span className="text-xs text-muted-foreground">
                      No actions
                    </span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusOpen(true);
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Update Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={statusOpen}
        onOpenChange={(next) => {
          setStatusOpen(next);
          if (!next) setSelectedOrder(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Update Order #{selectedOrder?._id.slice(-8) ?? ""}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <SellerOrderStatusForm
              order={selectedOrder}
              onSuccess={() => {
                setStatusOpen(false);
                setSelectedOrder(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
