"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import BannerModel from "@/features/content/models/banner.model";
import { revalidatePath } from "next/cache";

const BannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  subtitle: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  imageUrl: z.string().url("Invalid image URL"),
  linkUrl: z
    .string()
    .url("Invalid link URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  position: z.enum(["hero", "category", "sidebar", "footer"]),
  sortOrder: z.preprocess(
    (val) => Number(val),
    z.number().int().min(0).default(0),
  ),
  startDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  endDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  targetAudience: z.enum(["all", "customer", "seller", "admin"]).default("all"),
  language: z.string().default("en"),
  isActive: z.boolean().default(true),
});

export async function fetchBanners() {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    const banners = await BannerModel.find({})
      .sort({ position: 1, sortOrder: 1 })
      .lean();
    return { success: true, data: banners };
  } catch {
    return { success: false, error: "Failed to fetch banners" };
  }
}

export async function createBanner(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = BannerSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  await dbConnect();
  try {
    await BannerModel.create(validated.data);
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create banner" };
  }
}

export async function updateBanner(bannerId: string, rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = BannerSchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  await dbConnect();
  try {
    await BannerModel.findByIdAndUpdate(bannerId, validated.data);
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update banner" };
  }
}

export async function toggleBannerStatus(bannerId: string) {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    const banner = await BannerModel.findById(bannerId);
    if (!banner) return { success: false, error: "Banner not found" };
    await BannerModel.findByIdAndUpdate(bannerId, {
      isActive: !banner.isActive,
    });
    revalidatePath("/admin/banners");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}
