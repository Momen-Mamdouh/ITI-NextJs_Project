import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";
import ProductModel from "@/features/products/models/product.model";
import UserModel from "@/features/user/models/user.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await dbConnect();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const order = await OrderModel.findById(orderId);
    if (!order || order.paymentStatus === "paid") {
      return NextResponse.json({ received: true });
    }

    order.paymentStatus = "paid";
    order.status = "processing";
    order.stripeSessionId = session.id;
    order.statusHistory.push({
      status: "processing",
      note: "Payment confirmed via Stripe",
      createdAt: new Date(),
    });
    await order.save();

    for (const item of order.items) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    if (order.userId) {
      await UserModel.findByIdAndUpdate(order.userId, {
        $set: { cartItems: [] },
      });
    }
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const sessionId = (
      event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent
    ).id;
    await OrderModel.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        paymentStatus: "failed",
        status: "cancelled",
        $push: {
          statusHistory: {
            status: "cancelled",
            note: "Payment failed or session expired",
            createdAt: new Date(),
          },
        },
      },
    );
  }

  return NextResponse.json({ received: true });
}
