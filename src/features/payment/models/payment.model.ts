import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    stripePaymentIntentId: { type: String, required: true, index: true },
    stripeCustomerId: String,
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "usd" },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["card", "paypal", "razorpay"],
      default: "card",
    },
    cardLast4: String,
    cardBrand: String,
    receiptUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

paymentSchema.index({ stripePaymentIntentId: 1 }, { unique: true });

export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
