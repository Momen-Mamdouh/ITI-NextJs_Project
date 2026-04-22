import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: { type: String, required: true, trim: true, index: true },
    description: { type: String, maxlength: 500 },
    logo: String,
    banner: String,
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
      index: true,
    },
    payoutAccountConnected: { type: Boolean, default: false },
    stripeAccountId: String,
    earnings: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

sellerSchema.index({ userId: 1, status: 1 });
sellerSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "sellerId",
});

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
