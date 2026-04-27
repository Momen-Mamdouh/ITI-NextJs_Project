"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Wallet,
  Banknote,
  Loader2,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { placeOrder } from "@/features/checkout/checkout-actions";
import Link from "next/link";

const PAYMENT_METHODS = [
  {
    id: "stripe" as const,
    label: "Credit / Debit Card",
    icon: CreditCard,
    description: "Pay securely via Stripe",
    enabled: true,
  },
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    icon: Banknote,
    description: "Pay when you receive",
    enabled: true,
  },
  {
    id: "wallet" as const,
    label: "Wallet",
    icon: Wallet,
    description: "Coming soon",
    enabled: false,
  },
] as const;

type PaymentMethodId = "stripe" | "cod" | "wallet";

type ShippingForm = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

type GuestForm = {
  name: string;
  email: string;
};

const emptyShipping: ShippingForm = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "EG",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, items, isHydrated, subtotal, clearLocal } = useCart();

  const [shipping, setShipping] = useState<ShippingForm>(emptyShipping);
  const [guest, setGuest] = useState<GuestForm>({ name: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<
    (ShippingForm & { _id: string; label?: string })[]
  >([]);

  const isGuest = !user;
  const isCustomer = user?.role === "customer";

  useEffect(() => {
    if (!isHydrated) return;
    if (user && user.role !== "customer") {
      router.replace("/");
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (!isCustomer) return;
    (async () => {
      try {
        const res = await fetch("/api/checkout/session", {
          credentials: "include",
        });
        const data = await res.json();
        const addrs = data?.addresses ?? [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setUseSavedAddress(true);
          const def = addrs.find(
            (a: { isDefault?: boolean }) => a.isDefault,
          ) ?? addrs[0];
          setShipping({
            fullName: def.fullName ?? "",
            addressLine1: def.addressLine1 ?? "",
            addressLine2: def.addressLine2 ?? "",
            city: def.city ?? "",
            state: def.state ?? "",
            postalCode: def.postalCode ?? "",
            country: def.country ?? "EG",
            phone: def.phone ?? "",
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, [isCustomer]);

  if (!isHydrated) {
    return (
      <div className="container max-w-4xl py-16 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (user && user.role !== "customer") return null;

  if (items.length === 0) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add items to your cart before checking out.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants(), "mt-6 inline-flex")}
        >
          Browse shop
        </Link>
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.14 * 100) / 100;
  const ship = 5;
  const total = Math.round((subtotal + tax + ship) * 100) / 100;

  function updateShipping(field: keyof ShippingForm, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function pickSavedAddress(addrId: string) {
    const addr = savedAddresses.find((a) => a._id === addrId);
    if (!addr) return;
    setShipping({
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone ?? "",
    });
  }

  async function handlePlaceOrder() {
    if (
      !shipping.fullName.trim() ||
      !shipping.addressLine1.trim() ||
      !shipping.city.trim() ||
      !shipping.state.trim() ||
      !shipping.postalCode.trim()
    ) {
      toast.error("Please fill all required shipping fields");
      return;
    }

    if (isGuest && (!guest.name.trim() || !guest.email.trim())) {
      toast.error("Please enter your name and email");
      return;
    }

    setPlacing(true);
    try {
      const result = await placeOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          image: i.image,
          sellerId: i.sellerId,
        })),
        shippingAddress: {
          fullName: shipping.fullName.trim(),
          addressLine1: shipping.addressLine1.trim(),
          addressLine2: shipping.addressLine2?.trim() || undefined,
          city: shipping.city.trim(),
          state: shipping.state.trim(),
          postalCode: shipping.postalCode.trim(),
          country: shipping.country.trim(),
          phone: shipping.phone?.trim() || undefined,
        },
        paymentMethod,
        guestEmail: isGuest ? guest.email.trim() : undefined,
        guestName: isGuest ? guest.name.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to place order");
        return;
      }

      if (result.stripeUrl) {
        clearLocal();
        window.location.href = result.stripeUrl;
        return;
      }

      clearLocal();
      toast.success("Order placed successfully!");
      router.push(`/checkout/confirmation/${result.orderId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/cart"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "inline-flex gap-1",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to cart
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isGuest
          ? "Complete as guest or sign in to track your order."
          : "Review your items and complete your order."}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left: forms */}
        <div className="space-y-6 lg:col-span-3">
          {/* Guest info */}
          {isGuest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Want to track orders and save your cart?{" "}
                  <a
                    href="/auth/register?next=/checkout"
                    className="text-primary underline"
                  >
                    Create an account
                  </a>{" "}
                  or{" "}
                  <a
                    href="/auth/login?next=/checkout"
                    className="text-primary underline"
                  >
                    sign in
                  </a>
                  .
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full name *</Label>
                    <Input
                      value={guest.name}
                      onChange={(e) =>
                        setGuest((g) => ({ ...g, name: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={guest.email}
                      onChange={(e) =>
                        setGuest((g) => ({ ...g, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCustomer && savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((addr) => (
                      <Button
                        key={addr._id}
                        type="button"
                        variant={
                          useSavedAddress &&
                          shipping.addressLine1 === addr.addressLine1
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setUseSavedAddress(true);
                          pickSavedAddress(addr._id);
                        }}
                      >
                        {addr.label || "Address"}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={!useSavedAddress ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUseSavedAddress(false);
                        setShipping(emptyShipping);
                      }}
                    >
                      New address
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Full name *</Label>
                  <Input
                    value={shipping.fullName}
                    onChange={(e) => updateShipping("fullName", e.target.value)}
                    placeholder="Recipient name"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address line 1 *</Label>
                  <Input
                    value={shipping.addressLine1}
                    onChange={(e) =>
                      updateShipping("addressLine1", e.target.value)
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address line 2</Label>
                  <Input
                    value={shipping.addressLine2}
                    onChange={(e) =>
                      updateShipping("addressLine2", e.target.value)
                    }
                    placeholder="Apt, floor, etc."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <Input
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    placeholder="Cairo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State *</Label>
                  <Input
                    value={shipping.state}
                    onChange={(e) => updateShipping("state", e.target.value)}
                    placeholder="Cairo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Postal code *</Label>
                  <Input
                    value={shipping.postalCode}
                    onChange={(e) =>
                      updateShipping("postalCode", e.target.value)
                    }
                    placeholder="11511"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                    placeholder="+20..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((pm) => {
                  const selected = paymentMethod === pm.id;
                  const disabled = !pm.enabled;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) setPaymentMethod(pm.id);
                      }}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-start transition-colors",
                        disabled
                          ? "cursor-not-allowed border-border bg-muted/40 opacity-50"
                          : selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40",
                      )}
                    >
                      <pm.icon
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          disabled
                            ? "text-muted-foreground"
                            : selected
                              ? "text-primary"
                              : "text-muted-foreground",
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !disabled && selected && "text-primary",
                          )}
                        >
                          {pm.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pm.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "stripe" && (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  You&apos;ll be redirected to Stripe&apos;s secure checkout to
                  complete payment.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions for delivery…"
                rows={3}
                maxLength={500}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((line) => (
                  <div
                    key={line.productId}
                    className="flex items-start gap-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="line-clamp-1 font-medium">{line.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.quantity} × ${line.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ${(line.price * line.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (14%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${ship.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Badge variant="secondary" className="w-full justify-center">
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </Badge>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={placing}
                  onClick={handlePlaceOrder}
                >
                  {placing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {paymentMethod === "stripe"
                        ? "Redirecting to Stripe…"
                        : "Placing order…"}
                    </>
                  ) : paymentMethod === "stripe" ? (
                    `Pay with Stripe · $${total.toFixed(2)}`
                  ) : (
                    `Place order · $${total.toFixed(2)}`
                  )}
                </Button>

                {paymentMethod === "cod" && (
                  <p className="text-center text-xs text-muted-foreground">
                    You&apos;ll pay when you receive the package.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
