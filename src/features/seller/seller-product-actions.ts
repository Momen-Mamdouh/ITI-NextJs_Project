"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ProductModel from "@/features/products/models/product.model";
import SellerModel from "@/features/seller/models/seller.model";
import { revalidatePath } from "next/cache";

async function getAuthenticatedSellerId() {
  const session = await requireAuth(["seller"]);
  await dbConnect();
  const seller = await SellerModel.findOne({ userId: session.id })
    .select("_id")
    .lean();
  if (!seller) throw new Error("Seller profile not found");
  return seller._id.toString();
}

const ProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.preprocess((val) => Number(val), z.number().positive()),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0)),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  isActive: z.boolean().default(true),
});

export async function fetchSellerProducts() {
  const sellerId = await getAuthenticatedSellerId();
  try {
    const products = await ProductModel.find({ sellerId })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: products };
  } catch {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function createSellerProduct(rawData: unknown) {
  const sellerId = await getAuthenticatedSellerId();
  const validated = ProductSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  try {
    const productData = { ...validated.data, sellerId };
    await ProductModel.create(productData);
    revalidatePath("/seller/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateSellerProduct(productId: string, rawData: unknown) {
  const sellerId = await getAuthenticatedSellerId();
  const validated = ProductSchema.partial().safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  try {
    const product = await ProductModel.findOne({ _id: productId, sellerId });
    if (!product)
      return { success: false, error: "Unauthorized or product not found" };

    await ProductModel.findByIdAndUpdate(productId, validated.data);
    revalidatePath("/seller/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleSellerProductStatus(productId: string) {
  const sellerId = await getAuthenticatedSellerId();
  try {
    const product = await ProductModel.findOne({ _id: productId, sellerId });
    if (!product) return { success: false, error: "Unauthorized" };

    await ProductModel.findByIdAndUpdate(productId, {
      isActive: !product.isActive,
    });
    revalidatePath("/seller/products");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}
