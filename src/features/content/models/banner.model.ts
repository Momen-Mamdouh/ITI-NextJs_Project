import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    imageUrl: { type: String, required: true },
    linkUrl: String,
    position: {
      type: String,
      enum: ["hero", "category", "sidebar", "footer"],
      default: "hero",
    },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: Date,
    endDate: Date,
    targetAudience: {
      type: String,
      enum: ["all", "customer", "seller", "admin"],
      default: "all",
    },
    language: { type: String, default: "en", index: true },
  },
  { timestamps: true },
);

bannerSchema.index({ position: 1, sortOrder: 1, isActive: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
