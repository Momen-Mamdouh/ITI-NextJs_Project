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
  CheckCircle2,
  MapPin,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    description: "Pay securely via Stripe",
    icon: CreditCard,
    enabled: true,
  },
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Banknote,
    enabled: true,
  },
  {
    id: "wallet" as const,
    label: "Digital Wallet",
    description: "Coming soon",
    icon: Wallet,
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

// Checkout progress steps
const CHECKOUT_STEPS = [
  { id: 1, label: "Cart", completed: true },
  { id: 2, label: "Details", completed: false },
  { id: 3, label: "Payment", completed: false },
  { id: 4, label: "Confirm", completed: false },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, subtotal, clearLocal, user } = useCart();

  // Form state
  const [step] = useState(2);
  const [shipping, setShipping] = useState(emptyShipping);
  const [guest, setGuest] = useState<GuestForm>({ name: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);

  // Saved addresses (for logged-in customers)
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<
    (ShippingForm & { _id: string; label?: string })[]
  >([]);

  const isGuest = !user;
  const isCustomer = user?.role === "customer";

  // Redirect non-customers
  useEffect(() => {
    if (!isHydrated) return;
    if (user && user.role !== "customer") {
      router.replace("/");
    }
  }, [isHydrated, user, router]);

  // Load saved addresses for customers
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
          const def =
            addrs.find((a: { isDefault?: boolean }) => a.isDefault) ?? addrs[0];
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

  // Validation
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== "customer") return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add items to your cart before checking out.
            </p>
            <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
              Browse Shop
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tax = Math.round(subtotal * 0.14 * 100) / 100;
  const shippingCost = 5;
  const total = Math.round((subtotal + tax + shippingCost) * 100) / 100;

  const updateShipping = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const pickSavedAddress = (addrId: string) => {
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
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Shipping validation
    if (!shipping.fullName.trim()) errors.push("Full name is required");
    if (!shipping.addressLine1.trim())
      errors.push("Address line 1 is required");
    if (!shipping.city.trim()) errors.push("City is required");
    if (!shipping.state.trim()) errors.push("State is required");
    if (!shipping.postalCode.trim()) errors.push("Postal code is required");

    // Guest validation
    if (isGuest) {
      if (!guest.name.trim()) errors.push("Your name is required");
      if (
        !guest.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)
      ) {
        errors.push("Valid email is required");
      }
    }

    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
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

      // Handle Stripe redirect
      if (result.stripeUrl) {
        // Cart will be cleared after successful payment via webhook

        window.location.href = result.stripeUrl;
        await clearLocal();
        return;
      }

      // For non-Stripe payments, clear cart immediately
      clearLocal();
      toast.success("Order placed successfully!");
      router.push(`/checkout/confirmation/${result.orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {CHECKOUT_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  s.completed || s.id === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {s.completed ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:inline",
                  s.id === step ? "font-medium" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
              {i < CHECKOUT_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-12 sm:w-20",
                    s.completed || s.id < step ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
      </div>

      <p className="mb-8 text-sm text-muted-foreground">
        {isGuest
          ? "Complete as guest or sign in to track your order."
          : "Review your items and complete your order."}
      </p>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Forms */}
        <div className="space-y-6 lg:col-span-3">
          {/* Guest Info */}
          {isGuest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Want to track orders and save your cart?{" "}
                  <Link
                    href="/auth/register?next=/checkout"
                    className="text-primary underline"
                  >
                    Create an account
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/auth/login?next=/checkout"
                    className="text-primary underline"
                  >
                    sign in
                  </Link>
                  .
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Full name *</Label>
                    <Input
                      id="guest-name"
                      value={guest.name}
                      onChange={(e) =>
                        setGuest((g) => ({ ...g, name: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Email *</Label>
                    <Input
                      id="guest-email"
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

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved Addresses */}
              {isCustomer && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <Label>Use saved address</Label>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ship-name">Full name *</Label>
                  <Input
                    id="ship-name"
                    value={shipping.fullName}
                    onChange={(e) => updateShipping("fullName", e.target.value)}
                    placeholder="Recipient name"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ship-address1">Address line 1 *</Label>
                  <Input
                    id="ship-address1"
                    value={shipping.addressLine1}
                    onChange={(e) =>
                      updateShipping("addressLine1", e.target.value)
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ship-address2">
                    Address line 2 (optional)
                  </Label>
                  <Input
                    id="ship-address2"
                    value={shipping.addressLine2}
                    onChange={(e) =>
                      updateShipping("addressLine2", e.target.value)
                    }
                    placeholder="Apt, floor, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-city">City *</Label>
                  <Input
                    id="ship-city"
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    placeholder="Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-state">State *</Label>
                  <Input
                    id="ship-state"
                    value={shipping.state}
                    onChange={(e) => updateShipping("state", e.target.value)}
                    placeholder="Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-postal">Postal code *</Label>
                  <Input
                    id="ship-postal"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      updateShipping("postalCode", e.target.value)
                    }
                    placeholder="11511"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-country">Country *</Label>
                  <Input
                    id="ship-country"
                    value={shipping.country}
                    onChange={(e) => updateShipping("country", e.target.value)}
                    placeholder="EG"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ship-phone">Phone (optional)</Label>
                  <Input
                    id="ship-phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                    placeholder="+20..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const selected = paymentMethod === pm.id;
                  const disabled = !pm.enabled;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setPaymentMethod(pm.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-start transition-all",
                        disabled
                          ? "cursor-not-allowed border-border bg-muted/40 opacity-50"
                          : selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/30",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0",
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
                  {`You'll be redirected to Stripe's secure checkout to complete payment.`}
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-2h2v2zm0-4H9V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    SSL Encrypted
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Order Notes (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions for delivery..."
                rows={3}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {notes.length}/500 characters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((line) => (
                    <div
                      key={line.productId}
                      className="flex items-start gap-3"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {line.image &&
                          (line.image.startsWith("http") &&
                          !line.image.includes("cloudinary.com") ? (
                            <img
                              src={line.image}
                              alt={line.name}
                              className="h-full w-full object-cover"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ))}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="line-clamp-1 font-medium">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.quantity} × ${line.price.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        ${(line.price * line.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
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
                    <span>
                      {!shippingCost ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Selected Payment */}
                <Badge
                  variant="secondary"
                  className="w-full justify-center py-2"
                >
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === "stripe"
                        ? "Redirecting to Stripe..."
                        : "Placing order..."}
                    </>
                  ) : paymentMethod === "stripe" ? (
                    `Pay with Stripe · $${total.toFixed(2)}`
                  ) : (
                    `Place order · $${total.toFixed(2)}`
                  )}
                </Button>

                {paymentMethod === "cod" && (
                  <p className="text-center text-xs text-muted-foreground">
                    {`You'll pay when you receive the package.`}
                  </p>
                )}

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
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
                  Your payment information is encrypted and secure
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
