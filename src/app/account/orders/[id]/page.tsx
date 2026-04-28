import { getOrderDetail } from "@/features/user/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import type { Metadata } from "next";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe: "Stripe",
  cod: "Cash on Delivery",
  wallet: "Wallet",
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const result = await getOrderDetail(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order._id.slice(-8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{order.status}</Badge>
        <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
          Payment: {order.paymentStatus}
        </Badge>
        {order.paymentMethod && (
          <Badge variant="secondary">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map(
              (
                item: {
                  name: string;
                  quantity: number;
                  price: number;
                  discount: number;
                },
                i: number,
              ) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.discount > 0 && (
                      <p className="text-xs text-green-600">
                        -${item.discount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Tracking</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-0.5">
              {order.shippingAddress ? (
                <>
                  <p className="font-medium text-foreground">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p>{order.shippingAddress.phone}</p>
                  )}
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Order details",
};
