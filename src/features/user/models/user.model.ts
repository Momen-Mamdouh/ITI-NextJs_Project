import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: { type: String, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    isSoftDeleted: { type: Boolean, default: false, index: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    savedCards: [
      {
        stripeCardId: String,
        brand: String,
        last4: String,
        expMonth: Number,
        expYear: Number,
        isDefault: Boolean,
      },
    ],
    loyaltyPoints: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: "en" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index(
  { email: 1, isSoftDeleted: 1 },
  { partialFilterExpression: { isSoftDeleted: false } },
);
userSchema.pre("find", function () {
  this.where({ isSoftDeleted: { $ne: true } });
});
userSchema.pre("findOne", function () {
  this.where({ isSoftDeleted: { $ne: true } });
});

export default mongoose.models.User || mongoose.model("User", userSchema);
