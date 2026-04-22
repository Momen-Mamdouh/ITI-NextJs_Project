import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/features/payment/services/stripe.service";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";
import PaymentModel from "@/features/payment/models/payment.model";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  try {
    await dbConnect();
    const event = verifyWebhookSignature(body, signature);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const { id, amount, metadata, receipt_url, payment_method } = event.data
          .object as unknown as {
          id: string;
          amount: number;
          metadata: { orderId: string };
          receipt_url?: string;
          payment_method: string;
        };

        const { orderId } = metadata;

        await OrderModel.findByIdAndUpdate(orderId, {
          status: "paid",
          paymentStatus: "paid",
          notes: `Paid via Stripe (${id})`,
        });

        await PaymentModel.findOneAndUpdate(
          { stripePaymentIntentId: id },
          {
            orderId,
            stripePaymentIntentId: id,
            amount: amount / 100,
            currency: "usd",
            status: "succeeded",
            method: "card",
            receiptUrl: receipt_url || "",
            meta: { payment_method },
          },
          { upsert: true, new: true },
        );

        console.log(`PaymentIntent ${id} succeeded for Order ${orderId}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const { id, metadata } = event.data.object as unknown as {
          id: string;
          metadata: { orderId: string };
        };
        const { orderId } = metadata;

        await OrderModel.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
        });
        await PaymentModel.findOneAndUpdate(
          { stripePaymentIntentId: id },
          { status: "failed" },
          { upsert: true },
        );
        console.log(`PaymentIntent ${id} failed`);
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
