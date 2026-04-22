"use server";
import { createPaymentIntent } from "@/features/payment/services/stripe.service";
import { z } from "zod";

const PaymentIntentSchema = z.object({
  amount: z.number().min(50),
  currency: z.string().default("usd"),
});

export async function initiateCheckout(
  data: z.infer<typeof PaymentIntentSchema>,
) {
  const validated = PaymentIntentSchema.parse(data);
  try {
    const intent = await createPaymentIntent(
      validated.amount,
      validated.currency,
    );
    return { success: true, clientSecret: intent.client_secret };
  } catch {
    return { success: false, error: "Payment initiation failed" };
  }
}
