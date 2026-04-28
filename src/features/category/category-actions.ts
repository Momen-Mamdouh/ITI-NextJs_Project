"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CategoryModel from "@/features/category/models/category.model";
import { revalidatePath } from "next/cache";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export async function fetchCategories() {
  await dbConnect();
  try {
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch {
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function fetchActiveCategoryNames() {
  await dbConnect();
  try {
    const categories = await CategoryModel.find({ isActive: true })
      .sort({ name: 1 })
      .select("name")
      .lean();
    return {
      success: true,
      names: categories.map((c) => c.name as string),
    };
  } catch {
    return { success: false, names: [] as string[] };
  }
}

export async function createCategory(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = CategorySchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const slug = validated.data.slug?.trim() || slugify(validated.data.name);
    const category = await CategoryModel.create({
      ...validated.data,
      slug,
    });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: { id: category._id.toString() } };
  } catch {
    return { success: false, error: "Failed to create category (duplicate slug?)" };
  }
}

export async function updateCategory(categoryId: string, rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = CategorySchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const patch = { ...validated.data };
    if (validated.data.name && !validated.data.slug) {
      (patch as { slug?: string }).slug = slugify(validated.data.name);
    }
    await CategoryModel.findByIdAndUpdate(categoryId, patch);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(categoryId: string) {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    await CategoryModel.findByIdAndDelete(categoryId);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category" };
  }
}
