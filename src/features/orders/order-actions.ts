"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";
import { revalidatePath } from "next/cache";

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  note: z.string().max(300).optional(),
});

export async function fetchOrders(filters?: {
  status?: string;
  search?: string;
}) {
  await requireAuth(["admin"]);
  await dbConnect();
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  if (filters?.search) {
    query.$or = [
      { _id: { $regex: filters.search, $options: "i" } },
      { "shippingAddress.fullName": { $regex: filters.search, $options: "i" } },
      {
        "shippingAddress.postalCode": { $regex: filters.search, $options: "i" },
      },
    ];
  }
  try {
    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch {
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = UpdateOrderStatusSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, error: "Invalid input data" };

  await dbConnect();
  try {
    const { orderId, status, trackingNumber, carrier, note } = validated.data;

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(carrier ? { carrier } : {}),
        $push: {
          statusHistory: {
            status,
            note: note || `Status changed to ${status}`,
          },
        },
      },
      { new: true },
    ).lean();

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update order status" };
  }
}
