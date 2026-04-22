"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SellerModel from "@/features/seller/models/seller.model";
import { revalidatePath } from "next/cache";

const SellerProfileSchema = z.object({
  storeName: z
    .string()
    .min(3, "Store name must be at least 3 characters")
    .max(100),
  description: z.string().max(500).optional(),
  logo: z
    .string()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  banner: z
    .string()
    .url("Invalid banner URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  payoutEmail: z.string().email("Invalid payout email").optional(),
  bankAccountLast4: z.string().length(4).optional(),
});

export async function getSellerProfile() {
  const session = await requireAuth(["seller", "admin"]);
  await dbConnect();
  const seller = await SellerModel.findOne({ userId: session.id }).lean();
  return { success: true, seller };
}

export async function updateSellerProfile(rawData: unknown) {
  const session = await requireAuth(["seller"]);
  const validated = SellerProfileSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  await dbConnect();
  try {
    const seller = await SellerModel.findOne({ userId: session.id });
    if (!seller) {
      await SellerModel.create({
        userId: session.id,
        ...validated.data,
        status: "pending",
      });
    } else {
      await SellerModel.findByIdAndUpdate(seller._id, validated.data, {
        new: true,
      });
    }
    revalidatePath("/seller/profile");
    revalidatePath("/seller");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}
