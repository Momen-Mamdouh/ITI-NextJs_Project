"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { useCart } from "@/components/cart/CartProvider";
import { toast } from "sonner";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, isHydrated, subtotal, updateQuantity, removeItem, user } =
    useCart();
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.14 * 100) / 100;
  const shipping = subtotal > 0 ? 5 : 0;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal,
  );

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    // TODO: Implement promo validation API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.info("Promo code validation coming soon");
    setApplyingPromo(false);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-muted-foreground">
          {items.length === 0
            ? "Your cart is empty"
            : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {`Looks like you haven't added anything yet. Start exploring our products!`}
            </p>
            <Link
              href="/"
              className={cn(buttonVariants(), "mt-6 inline-flex gap-2")}
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((line) => {
              return (
                <Card key={line.productId} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {line.image ? (
                          line.image.startsWith("http") &&
                          !line.image.includes("cloudinary.com") ? (
                            <img
                              src={line.image}
                              alt={line.name}
                              className="h-full w-full object-cover"
                              width={96}
                              height={96}
                            />
                          ) : (
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium leading-snug line-clamp-2">
                              {line.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              ${line.price.toFixed(2)} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => {
                              removeItem(line.productId);
                              toast.success("Removed from cart");
                            }}
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => {
                              if (line.quantity <= 1) {
                                removeItem(line.productId);
                                toast.success("Removed from cart");
                              } else {
                                updateQuantity(
                                  line.productId,
                                  line.quantity - 1,
                                );
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                            {line.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => {
                              const maxQty = 999;
                              if (line.quantity < maxQty) {
                                updateQuantity(
                                  line.productId,
                                  line.quantity + 1,
                                );
                              } else {
                                toast.message("Maximum stock reached");
                              }
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-end font-semibold tabular-nums sm:mt-0">
                        ${(line.price * line.quantity).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Promo Code Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                    disabled={applyingPromo}
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || applyingPromo}
                    variant="outline"
                  >
                    {applyingPromo ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Free Shipping Progress */}
                  {remainingForFreeShipping > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Add{" "}
                          <strong>
                            ${remainingForFreeShipping.toFixed(2)}
                          </strong>{" "}
                          for free shipping
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Est. tax (14%)
                      </span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600 font-medium">
                            Free
                          </span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Protected
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Notice */}
              {!user && (
                <Card className="bg-muted/30">
                  <CardContent className="py-4 text-center text-sm">
                    <p className="text-muted-foreground">
                      You can checkout as a guest, or{" "}
                      <Link
                        href="/auth/login?next=/checkout"
                        className="text-primary underline"
                      >
                        sign in
                      </Link>{" "}
                      to track orders and save your cart.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
