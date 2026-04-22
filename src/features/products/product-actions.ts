"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ProductModel from "@/features/products/models/product.model";
import { revalidatePath } from "next/cache";

const ProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).min(1),
  sellerId: z.string().min(1),
  isActive: z.boolean().default(true),
  discount: z
    .object({
      type: z.enum(["percent", "fixed"]).optional(),
      value: z.number().min(0).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
});

export async function fetchProducts(filters?: {
  category?: string;
  search?: string;
  sellerId?: string;
}) {
  await dbConnect();
  const query: Record<string, unknown> = {};
  if (filters?.category) query.category = filters.category;
  if (filters?.sellerId) query.sellerId = filters.sellerId;
  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }
  try {
    const products = await ProductModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: products };
  } catch {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function createProduct(rawData: unknown) {
  const session = await requireAuth(["admin", "seller"]);
  const validated = ProductSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const productData = { ...validated.data, sellerId: session.id };
    const product = await ProductModel.create(productData);
    revalidatePath("/admin/products");
    return { success: true, data: { id: product._id } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(productId: string, rawData: unknown) {
  const session = await requireAuth(["admin", "seller"]);
  const validated = ProductSchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return { success: false, error: "Product not found" };
    if (
      session.role !== "admin" &&
      product.sellerId.toString() !== session.id
    ) {
      return { success: false, error: "Unauthorized" };
    }
    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      validated.data,
      { new: true },
    );
    revalidatePath("/admin/products");
    return { success: true, data: { id: updated._id } };
  } catch {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleProductStatus(
  productId: string,
  isActive: boolean,
) {
  const session = await requireAuth(["admin", "seller"]);
  await dbConnect();
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return { success: false, error: "Product not found" };
    if (
      session.role !== "admin" &&
      product.sellerId.toString() !== session.id
    ) {
      return { success: false, error: "Unauthorized" };
    }
    await ProductModel.findByIdAndUpdate(productId, { isActive });
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

export async function softDeleteProduct(productId: string) {
  const session = await requireAuth(["admin", "seller"]);
  await dbConnect();
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return { success: false, error: "Product not found" };
    if (
      session.role !== "admin" &&
      product.sellerId.toString() !== session.id
    ) {
      return { success: false, error: "Unauthorized" };
    }
    await ProductModel.findByIdAndUpdate(productId, { isActive: false });
    revalidatePath("/admin/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete product" };
  }
}
