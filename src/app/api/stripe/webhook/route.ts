import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/features/payment/services/stripe.service";
import dbConnect from "@/lib/db";
import PaymentModel from "@/features/payment/models/payment.model";

export async function POST(req: NextRequest) {
  await dbConnect();
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  try {
    const event = await constructWebhookEvent(payload, signature);

    if (event.type === "payment_intent.succeeded") {
      const { id } = event.data.object as { id: string };
      await PaymentModel.findOneAndUpdate(
        { stripePaymentIntentId: id },
        { status: "succeeded" },
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
