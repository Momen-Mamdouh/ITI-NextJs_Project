"use server";

import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ProfileSchema, AddressSchema, ReviewSchema } from "@/features/user/schemas";
import UserModel from "@/features/user/models/user.model";
import ReviewModel from "@/features/user/models/review.model";
import OrderModel from "@/features/orders/models/order.model";
import ProductModel from "@/features/products/models/product.model";

// ─── Profile ────────────────────────────────────────────

export async function getProfile() {
  await dbConnect();
  const session = await requireAuth();
  const user = await UserModel.findById(session.id).lean();
  if (!user) return { success: false, error: "User not found" };
  return {
    success: true,
    user: JSON.parse(JSON.stringify(user)),
  };
}

export async function updateProfile(rawData: unknown) {
  await dbConnect();
  const session = await requireAuth();
  const validated = ProfileSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  const user = await UserModel.findByIdAndUpdate(
    session.id,
    { $set: validated.data },
    { new: true, runValidators: true },
  ).lean();

  return {
    success: true,
    user: JSON.parse(JSON.stringify(user)),
  };
}

// ─── Addresses ──────────────────────────────────────────

export async function addAddress(rawData: unknown) {
  await dbConnect();
  const session = await requireAuth();
  const validated = AddressSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  const data = validated.data;

  if (data.isDefault) {
    await UserModel.updateOne(
      { _id: session.id },
      { $set: { "addresses.$[].isDefault": false } },
    );
  }

  const user = await UserModel.findByIdAndUpdate(
    session.id,
    { $push: { addresses: data } },
    { new: true },
  ).lean();

  return { success: true, addresses: JSON.parse(JSON.stringify(user?.addresses)) };
}

export async function updateAddress(addressId: string, rawData: unknown) {
  await dbConnect();
  const session = await requireAuth();
  const validated = AddressSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  const data = validated.data;

  if (data.isDefault) {
    await UserModel.updateOne(
      { _id: session.id },
      { $set: { "addresses.$[].isDefault": false } },
    );
  }

  const setFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    setFields[`addresses.$.${key}`] = value;
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: session.id, "addresses._id": addressId },
    { $set: setFields },
    { new: true },
  ).lean();

  return { success: true, addresses: JSON.parse(JSON.stringify(user?.addresses)) };
}

export async function deleteAddress(addressId: string) {
  await dbConnect();
  const session = await requireAuth();
  const user = await UserModel.findByIdAndUpdate(
    session.id,
    { $pull: { addresses: { _id: addressId } } },
    { new: true },
  ).lean();

  return { success: true, addresses: JSON.parse(JSON.stringify(user?.addresses)) };
}

// ─── Wishlist ───────────────────────────────────────────

export async function getWishlistProductIds() {
  try {
    await dbConnect();
    const session = await requireAuth();
    const user = await UserModel.findById(session.id).select("wishlist").lean();
    if (!user?.wishlist?.length) return { success: true, ids: [] as string[] };
    return {
      success: true,
      ids: user.wishlist.map((id: unknown) => String(id)),
    };
  } catch {
    return { success: true, ids: [] as string[] };
  }
}

export async function mergeGuestWishlistIntoAccount(guestIds: string[]) {
  try {
    await dbConnect();
    const session = await requireAuth();
    if (session.role !== "customer") {
      return { success: true, merged: false, ids: [] as string[] };
    }
    const user = await UserModel.findById(session.id).select("wishlist");
    if (!user) return { success: false, merged: false, ids: [] as string[] };

    const existing = new Set(
      user.wishlist.map((id: { toString: () => string }) => id.toString()),
    );
    let changed = false;
    for (const gid of guestIds) {
      if (typeof gid === "string" && gid.length > 0 && !existing.has(gid)) {
        user.wishlist.push(gid);
        existing.add(gid);
        changed = true;
      }
    }
    if (changed) await user.save();
    return {
      success: true,
      merged: changed,
      ids: user.wishlist.map((id: { toString: () => string }) => id.toString()),
    };
  } catch {
    return { success: false, merged: false, ids: [] as string[] };
  }
}

export async function getWishlist() {
  await dbConnect();
  const session = await requireAuth();
  const user = await UserModel.findById(session.id)
    .populate({
      path: "wishlist",
      model: ProductModel,
      select: "name price images category rating reviewCount stock",
    })
    .lean();

  if (!user) return { success: false, items: [] };
  return {
    success: true,
    items: JSON.parse(JSON.stringify(user.wishlist)),
  };
}

export async function toggleWishlist(productId: string) {
  await dbConnect();
  const session = await requireAuth();
  const user = await UserModel.findById(session.id).select("wishlist");
  if (!user) return { success: false, error: "User not found" };

  const idx = user.wishlist.findIndex(
    (id: { toString: () => string }) => id.toString() === productId,
  );

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  return {
    success: true,
    inWishlist: idx === -1,
    wishlistCount: user.wishlist.length,
  };
}

// ─── Order History ──────────────────────────────────────

export async function getOrderHistory(page = 1, limit = 10) {
  await dbConnect();
  const session = await requireAuth();
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find({ userId: session.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments({ userId: session.id }),
  ]);

  return {
    success: true,
    orders: JSON.parse(JSON.stringify(orders)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOrderDetail(orderId: string) {
  await dbConnect();
  const session = await requireAuth();
  const order = await OrderModel.findOne({
    _id: orderId,
    userId: session.id,
  }).lean();

  if (!order) return { success: false, error: "Order not found" };
  return { success: true, order: JSON.parse(JSON.stringify(order)) };
}

// ─── Reviews ────────────────────────────────────────────

export async function getUserReviews(page = 1, limit = 10) {
  await dbConnect();
  const session = await requireAuth();
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    ReviewModel.find({ userId: session.id })
      .populate({ path: "productId", model: ProductModel, select: "name images price" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReviewModel.countDocuments({ userId: session.id }),
  ]);

  return {
    success: true,
    reviews: JSON.parse(JSON.stringify(reviews)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createReview(rawData: unknown) {
  await dbConnect();
  const session = await requireAuth();
  const validated = ReviewSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  const { productId, orderId, rating, title, comment } = validated.data;

  const existing = await ReviewModel.findOne({
    userId: session.id,
    productId,
  });
  if (existing)
    return { success: false, error: "You already reviewed this product" };

  let isVerifiedPurchase = false;
  if (orderId) {
    const order = await OrderModel.findOne({
      _id: orderId,
      userId: session.id,
      "items.productId": productId,
      status: { $in: ["delivered", "shipped"] },
    });
    isVerifiedPurchase = !!order;
  }

  const review = await ReviewModel.create({
    userId: session.id,
    productId,
    orderId,
    rating,
    title,
    comment,
    isVerifiedPurchase,
  });

  const stats = await ReviewModel.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  return { success: true, review: JSON.parse(JSON.stringify(review)) };
}

export async function deleteReview(reviewId: string) {
  await dbConnect();
  const session = await requireAuth();

  const review = await ReviewModel.findOneAndDelete({
    _id: reviewId,
    userId: session.id,
  });

  if (!review) return { success: false, error: "Review not found" };

  const stats = await ReviewModel.aggregate([
    { $match: { productId: review.productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await ProductModel.findByIdAndUpdate(review.productId, {
    rating: stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0,
    reviewCount: stats.length > 0 ? stats[0].count : 0,
  });

  return { success: true };
}
