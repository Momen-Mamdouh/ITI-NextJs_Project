"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, items, isHydrated, subtotal } = useCart();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/auth/register?next=/checkout");
      return;
    }
    if (user.role !== "customer") {
      router.replace("/");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated) {
    return (
      <div className="container max-w-lg py-16 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user || user.role !== "customer") {
    return null;
  }

  const tax = subtotal * 0.14;
  const ship = subtotal > 0 ? 5 : 0;
  const total = subtotal + tax + ship;

  return (
    <div className="container max-w-lg py-8 px-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Your cart is saved on your account. Add Stripe or PayPal here when
        you&apos;re ready.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {items.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            items.map((i) => (
              <div key={i.productId} className="flex justify-between">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (est.)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>${ship.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Button className="mt-6" variant="secondary" onClick={() => router.push("/")}>
        Back to shop
      </Button>
    </div>
  );
}
