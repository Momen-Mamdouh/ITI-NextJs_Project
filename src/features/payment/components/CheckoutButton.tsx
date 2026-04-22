// src/features/payment/components/CheckoutButton.tsx
"use client";
import { useState } from "react";
import { initiateCheckout } from "@/features/payment/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CheckoutButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  orderId,
  amount,
  currency = "usd",
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const result = await initiateCheckout({ orderId, amount, currency });
      if (result.success && result.clientSecret) {
        toast.success("Payment initialized. Completing secure checkout...");
      } else {
        toast.error(result.error || "Failed to initialize payment");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? "Processing..." : children || "Pay Now"}
    </Button>
  );
}
