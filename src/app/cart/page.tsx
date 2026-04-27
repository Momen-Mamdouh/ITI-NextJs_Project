"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { items, isHydrated, subtotal, updateQuantity, removeItem, user } =
    useCart();

  if (!isHydrated) {
    return (
      <div className="container max-w-3xl py-10 px-4 text-muted-foreground">
        Loading cart…
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.14 * 100) / 100;
  const ship = subtotal > 0 ? 5 : 0;
  const total = Math.round((subtotal + tax + ship) * 100) / 100;

  return (
    <div className="container max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {items.length === 0
          ? "Your cart is empty"
          : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
      </p>

      <div className="mt-8 space-y-3">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Your cart is empty. Start shopping!
              </p>
              <Link
                href="/"
                className={cn(buttonVariants(), "mt-4 inline-flex")}
              >
                Browse products
              </Link>
            </CardContent>
          </Card>
        ) : (
          items.map((line) => (
            <Card key={line.productId}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-snug line-clamp-2">
                    {line.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    ${line.price.toFixed(2)} each
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => {
                        if (line.quantity <= 1) {
                          removeItem(line.productId);
                        } else {
                          updateQuantity(line.productId, line.quantity - 1);
                        }
                      }}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="min-w-9 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        updateQuantity(line.productId, line.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="ms-2 text-destructive"
                      onClick={() => removeItem(line.productId)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-end font-medium tabular-nums">
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
            <CardTitle className="text-base">Order Summary</CardTitle>
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

            <div className="flex flex-col gap-2 pt-3 sm:flex-row">
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex flex-1 justify-center",
                )}
              >
                Continue shopping
              </Link>
              <Button
                className="flex-1"
                onClick={() => router.push("/checkout")}
                type="button"
              >
                Checkout
                <ArrowRight className="size-4" />
              </Button>
            </div>

            {!user && (
              <p className="text-center text-xs text-muted-foreground pt-1">
                You can check out as a guest, or{" "}
                <a
                  href="/auth/login?next=/checkout"
                  className="text-primary underline"
                >
                  sign in
                </a>{" "}
                to track your orders.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
