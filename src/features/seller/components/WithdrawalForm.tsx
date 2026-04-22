"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { requestPayout } from "@/features/seller/seller-earnings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const WithdrawalFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

type WithdrawalFormValues = z.infer<typeof WithdrawalFormSchema>;

export function WithdrawalForm({
  availableBalance,
}: {
  availableBalance: number;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(WithdrawalFormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(values: WithdrawalFormValues) {
    setLoading(true);
    if (values.amount > availableBalance) {
      toast.error("Amount exceeds available balance");
      setLoading(false);
      return;
    }
    const res = await requestPayout(values);
    setLoading(false);
    if (res.success) {
      toast.success("Withdrawal request submitted");
      form.reset();
    } else {
      toast.error(res.error || "Request failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Withdrawal Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processing..." : "Request Withdrawal"}
        </Button>
      </form>
    </Form>
  );
}
