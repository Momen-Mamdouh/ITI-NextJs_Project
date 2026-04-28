import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  Mail,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrderConfirmation } from "@/features/checkout/checkout-actions";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import type { Metadata } from "next";

const PAYMENT_LABELS: Record<string, string> = {
  stripe: "Credit / Debit Card",
  cod: "Cash on Delivery",
  wallet: "Digital Wallet",
};

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order confirmation",
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const result = await getOrderConfirmation(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;
  const addr = order.shippingAddress;

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Success Header */}{" "}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your purchase. Your order number is:
          </p>
          <p className="mt-1 font-mono font-semibold">{order._id}</p>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Status: {order.status}</Badge>
              <Badge
                variant={
                  order.paymentStatus === "paid" ? "default" : "secondary"
                }
              >
                Payment: {order.paymentStatus}
              </Badge>
              {order.paymentMethod && (
                <Badge variant="outline">
                  {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Item */}
            <div className="space-y-2 text-sm">
              {order.items?.map(
                (
                  item: { name: string; quantity: number; price: number },
                  idx: number,
                ) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ),
              )}
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping?.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {addr && (
              <>
                <Separator />
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping to:
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {addr.fullName}
                    <br />
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.country}
                    {addr.phone && ` · ${addr.phone}`}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              statusHistory={order.statusHistory || []}
              currentStatus={order.status}
              trackingNumber={order.trackingNumber}
              carrier={order.carrier}
            />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "inline-flex gap-1",
            )}
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          {order.userId && (
            <Link
              href="/account/orders"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex",
              )}
            >
              View My Orders
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
