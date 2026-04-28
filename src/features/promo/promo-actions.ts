"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import PromoModel from "@/features/promo/models/promo.model";
import { revalidatePath } from "next/cache";

const PromoSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(50),
  description: z.string().max(200).optional(),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.preprocess((val) => Number(val), z.number().positive()),
  minOrderValue: z.preprocess(
    (val) => Number(val),
    z.number().min(0).default(0),
  ),
  maxDiscount: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().positive().optional(),
  ),
  usageLimit: z.preprocess(
    (val) => Number(val),
    z.number().int().positive().optional(),
  ),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isActive: z.boolean().default(true),
  applicableRoles: z.array(z.enum(["customer", "seller", "admin"])).optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableSellers: z.array(z.string()).optional(),
});

export async function fetchPromos() {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    const promos = await PromoModel.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(promos)) };
  } catch {
    return { success: false, error: "Failed to fetch promo codes" };
  }
}

export async function createPromo(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = PromoSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  await dbConnect();
  try {
    const existing = await PromoModel.findOne({
      code: validated.data.code,
      isActive: true,
    });
    if (existing)
      return {
        success: false,
        errors: { code: ["Promo code already exists"] },
      };
    await PromoModel.create(validated.data);
    revalidatePath("/admin/promos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create promo" };
  }
}

export async function updatePromo(promoId: string, rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = PromoSchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  await dbConnect();
  try {
    await PromoModel.findByIdAndUpdate(promoId, validated.data);
    revalidatePath("/admin/promos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update promo" };
  }
}

export async function togglePromoStatus(promoId: string) {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    const promo = await PromoModel.findById(promoId);
    if (!promo) return { success: false, error: "Promo not found" };
    await PromoModel.findByIdAndUpdate(promoId, { isActive: !promo.isActive });
    revalidatePath("/admin/promos");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}
