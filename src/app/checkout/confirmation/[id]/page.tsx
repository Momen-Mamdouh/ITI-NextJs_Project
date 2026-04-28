import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrderConfirmation } from "@/features/checkout/checkout-actions";

const PAYMENT_LABELS: Record<string, string> = {
  stripe: "Credit / Debit Card (Stripe)",
  cod: "Cash on Delivery",
  wallet: "Wallet",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const result = await getOrderConfirmation(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;
  const addr = order.shippingAddress;

  return (
    <div className="container max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your purchase. Your order number is:
        </p>
        <p className="mt-1 font-mono text-sm font-semibold">{order._id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Status: {order.status}
            </Badge>
            <Badge variant="secondary">
              Payment: {order.paymentStatus}
            </Badge>
            <Badge variant="outline">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            {order.items?.map(
              (
                item: {
                  productId: string;
                  name: string;
                  quantity: number;
                  price: number;
                },
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
                <p className="font-medium">Shipping to:</p>
                <p className="text-muted-foreground">
                  {addr.fullName}
                  <br />
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  <br />
                  {addr.city}, {addr.state} {addr.postalCode}
                  <br />
                  {addr.country}
                  {addr.phone ? ` · ${addr.phone}` : ""}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default" }),
            "inline-flex gap-1",
          )}
        >
          Continue shopping
          <ArrowRight className="size-4" />
        </Link>
        {order.userId && (
          <Link
            href="/account/orders"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex",
            )}
          >
            View my orders
          </Link>
        )}
      </div>
    </div>
  );
}
