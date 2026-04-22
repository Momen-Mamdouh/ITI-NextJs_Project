import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, index: true },
    tags: [String],
    images: [{ type: String, required: true }],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    discount: {
      type: { type: String, enum: ["percent", "fixed"] },
      value: Number,
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true },
);

productSchema.index({ sellerId: 1, isActive: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.pre("find", function () {
  this.where({ isActive: { $ne: false } });
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
