"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateOrderStatus } from "@/features/orders/order-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const OrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

type OrderStatusValues = z.infer<typeof OrderStatusSchema>;

export function OrderStatusForm({
  order,
  onSuccess,
}: {
  order: { _id: string; status: string };
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<OrderStatusValues>({
    resolver: zodResolver(OrderStatusSchema),
    defaultValues: {
      orderId: order._id,
      status: order.status as OrderStatusValues["status"],
      trackingNumber: "",
      carrier: "",
    },
  });

  async function onSubmit(values: OrderStatusValues) {
    setLoading(true);
    const res = await updateOrderStatus(values);
    setLoading(false);
    if (res.success) {
      toast.success("Order updated successfully");
      onSuccess();
    } else {
      toast.error(res.error || "Failed to update");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Number</FormLabel>
                <FormControl>
                  <Input placeholder="1Z999AA10123456784" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carrier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrier</FormLabel>
                <FormControl>
                  <Input placeholder="FedEx, UPS, DHL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
