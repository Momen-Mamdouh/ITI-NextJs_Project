import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["percent", "fixed", "shipping"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    applicableRoles: [{ type: String, enum: ["customer", "seller", "admin"] }],
    applicableCategories: [String],
    applicableSellers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    ],
  },
  { timestamps: true },
);

promoSchema.index({ code: 1, isActive: 1 });
promoSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.PromoCode ||
  mongoose.model("PromoCode", promoSchema);
