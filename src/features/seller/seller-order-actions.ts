"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";
import UserModel from "@/features/user/models/user.model";
import SellerModel from "@/features/seller/models/seller.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail } from "@/lib/mailer";

async function getSellerObjectId() {
  await dbConnect();
  const session = await requireAuth(["seller"]);
  const seller = await SellerModel.findOne({ userId: session.id }).lean();
  if (!seller) throw new Error("Seller profile not found");
  return seller._id;
}

const UpdateSellerOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
});

export async function fetchSellerOrders() {
  const sellerId = await getSellerObjectId();
  try {
    const orders = await OrderModel.aggregate([
      { $unwind: "$items" },
      { $match: { "items.sellerId": new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: "$_id", root: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$root" } },
      { $sort: { createdAt: -1 } },
    ]);
    return { success: true, data: orders };
  } catch {
    return { success: false, error: "Failed to fetch orders" };
  }
}

async function resolveOrderEmail(order: { userId?: string; guestEmail?: string }): Promise<string | null> {
  if (order.guestEmail) return order.guestEmail;
  if (order.userId) {
    const user = await UserModel.findById(order.userId).select("email").lean();
    return (user as { email?: string } | null)?.email ?? null;
  }
  return null;
}

export async function updateSellerOrderStatus(rawData: unknown) {
  const sellerId = await getSellerObjectId();
  const validated = UpdateSellerOrderStatusSchema.safeParse(rawData);
  if (!validated.success) return { success: false, error: "Invalid input" };

  await dbConnect();
  try {
    const { orderId, status } = validated.data;
    const order = await OrderModel.findOne({
      _id: orderId,
      "items.sellerId": new mongoose.Types.ObjectId(sellerId),
    });
    if (!order)
      return { success: false, error: "Unauthorized or order not found" };

    const updated = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: {
          statusHistory: {
            status,
            note: `Status updated by seller to ${status}`,
          },
        },
      },
      { new: true },
    ).lean();

    if (updated) {
      const email = await resolveOrderEmail(updated as { userId?: string; guestEmail?: string });
      if (email) {
        sendOrderStatusEmail({
          to: email,
          orderId,
          newStatus: status,
        }).catch(() => {});
      }
    }

    revalidatePath("/seller/orders");
    revalidatePath("/account/orders");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update order" };
  }
}
