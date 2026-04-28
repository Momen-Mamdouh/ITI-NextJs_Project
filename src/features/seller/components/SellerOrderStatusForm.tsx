"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateSellerOrderStatus } from "@/features/seller/seller-order-actions";
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

const OrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
});

type OrderStatusValues = z.infer<typeof OrderStatusSchema>;

export function SellerOrderStatusForm({
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
    },
  });

  async function onSubmit(values: OrderStatusValues) {
    setLoading(true);
    const res = await updateSellerOrderStatus(values);
    setLoading(false);
    if (res.success) {
      toast.success("Order status updated");
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
              <FormLabel>New Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Save Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
