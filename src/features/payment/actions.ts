"use server";
import { z } from "zod";
import { createPaymentIntent } from "@/features/payment/services/stripe.service";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";

const CheckoutSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("usd"),
});

export async function initiateCheckout(rawData: unknown) {
  try {
    const session = await requireAuth(["customer", "seller", "admin"]);
    const validated = CheckoutSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        error: "Invalid payment data",
        details: validated.error.flatten().fieldErrors,
      };
    }

    const { orderId, amount, currency } = validated.data;

    await dbConnect();
    const order = await OrderModel.findOne({
      _id: orderId,
      userId: session.id,
    });
    if (!order) {
      return { success: false, error: "Order not found or unauthorized" };
    }

    const intent = await createPaymentIntent({
      amount,
      currency,
      orderId,
      receiptEmail: undefined,
    });

    return {
      success: true,
      clientSecret: intent.client_secret,
      intentId: intent.id,
    };
  } catch (error) {
    console.error("Checkout initiation failed:", error);
    return { success: false, error: "Failed to initialize payment" };
  }
}
