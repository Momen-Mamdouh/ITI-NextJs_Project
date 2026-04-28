"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import OrderModel from "@/features/orders/models/order.model";
import SellerModel from "@/features/seller/models/seller.model";
import { revalidatePath } from "next/cache";

export type EarningsData = {
  totalEarnings: number;
  pendingAmount: number;
  availableBalance: number;
};

export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export async function fetchSellerEarnings(): Promise<
  Result<{
    totalEarnings: number;
    pendingAmount: number;
    availableBalance: number;
  }>
> {
  const session = await requireAuth(["seller"]);
  await dbConnect();

  const seller = await SellerModel.findOne({ userId: session.id }).lean();
  if (!seller) {
    return { success: false, error: "Seller profile not found" };
  }

  const orders = await OrderModel.find({
    "items.sellerId": seller._id,
    paymentStatus: "paid",
  }).lean();

  let totalEarnings = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders.forEach((order: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order.items.forEach((item: any) => {
      if (item.sellerId?.toString() === seller._id.toString()) {
        totalEarnings += item.price * item.quantity;
      }
    });
  });

  const pendingAmount = totalEarnings * 0.15;
  const availableBalance = Math.max(0, totalEarnings - pendingAmount);

  return {
    success: true,
    data: {
      totalEarnings,
      pendingAmount,
      availableBalance,
    },
  };
}

const WithdrawalSchema = z.object({
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive("Amount must be positive").max(100000),
  ),
});

export async function requestPayout(rawData: unknown) {
  const session = await requireAuth(["seller"]);
  const validated = WithdrawalSchema.safeParse(rawData);
  if (!validated.success) return { success: false, error: "Invalid amount" };

  await dbConnect();
  const { amount } = validated.data;
  const earnings = await fetchSellerEarnings();
  if (!earnings.success) {
    return { success: false, error: earnings.error };
  }

  if (amount > (earnings.data?.availableBalance || 0)) {
    return { success: false, error: "Insufficient available balance" };
  }

  revalidatePath("/seller/earnings");
  return { success: true };
}
