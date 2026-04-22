"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { revalidatePath } from "next/cache";

const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function fetchCategories() {
  await dbConnect();
  try {
    const Category = (await import("mongoose")).default.model("Category");
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return { success: true, data: categories };
  } catch {
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createCategory(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = CategorySchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const Category = (await import("mongoose")).default.model("Category");
    const category = await Category.create(validated.data);
    revalidatePath("/admin/products");
    return { success: true, data: { id: category._id } };
  } catch {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(categoryId: string, rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = CategorySchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const Category = (await import("mongoose")).default.model("Category");
    await Category.findByIdAndUpdate(categoryId, validated.data);
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update category" };
  }
}
