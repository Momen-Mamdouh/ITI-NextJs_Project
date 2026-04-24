import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "EG" },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

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
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    isSoftDeleted: { type: Boolean, default: false, index: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cartItems: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 },
          name: { type: String, required: true },
          image: { type: String, default: "" },
          sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true,
          },
        },
      ],
      default: [],
    },
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
