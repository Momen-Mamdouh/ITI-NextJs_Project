import { stripe } from "@/lib/stripe";

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  orderId: string;
  receiptEmail?: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const { amount, currency, orderId, receiptEmail } = params;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects smallest currency unit
    currency,
    metadata: { orderId },
    receipt_email: receiptEmail,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export function verifyWebhookSignature(payload: string, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}
