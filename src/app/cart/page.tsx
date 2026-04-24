"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, CreditCard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    isHydrated,
    subtotal,
    updateQuantity,
    removeItem,
    user,
  } = useCart();

  if (!isHydrated) {
    return (
      <div className="container max-w-3xl py-10 px-4 text-muted-foreground">
        Loading cart…
      </div>
    );
  }

  const tax = subtotal * 0.14;
  const total = subtotal + tax + (subtotal > 0 ? 5 : 0);
  const ship = subtotal > 0 ? 5 : 0;

  function payNow() {
    if (!user) {
      router.push("/auth/register?next=/cart");
      return;
    }
    if (user.role !== "customer") {
      router.push("/");
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="container max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Shopping cart</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {items.length === 0
          ? "Your cart is empty"
          : `${items.length} line item(s)`}
      </p>

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p>Browse the shop and add products here.</p>
              <Link
                href="/"
                className={cn(buttonVariants(), "mt-4 inline-flex")}
              >
                Continue shopping
              </Link>
            </CardContent>
          </Card>
        ) : (
          items.map((line) => (
            <Card key={line.productId}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{line.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${line.price.toFixed(2)} each
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Qty</span>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      className="h-8 w-20"
                      value={line.quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (Number.isFinite(v) && v >= 1) {
                          updateQuantity(line.productId, v);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => removeItem(line.productId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-end font-medium">
                  ${(line.price * line.quantity).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {items.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. tax (14%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${ship.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Create an account to save your cart and continue to payment.
            </p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex flex-1 justify-center",
                )}
              >
                Continue shopping
              </Link>
              <Button className="flex-1" onClick={payNow} type="button">
                <CreditCard className="size-4" />
                Pay now
                <ArrowRight className="size-4" />
              </Button>
            </div>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                &quot;Pay now&quot; sends you to register so we can place your
                order. Already have an account?{" "}
                <a href="/auth/login?next=/cart" className="text-primary underline">
                  Sign in
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
