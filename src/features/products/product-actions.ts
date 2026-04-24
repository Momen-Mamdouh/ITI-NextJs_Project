"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ProductModel from "@/features/products/models/product.model";
import SellerModel from "@/features/seller/models/seller.model";
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

const ProductWriteSchema = ProductSchema.omit({ sellerId: true });
const ProductUpdateSchema = ProductSchema.partial().omit({ sellerId: true });

export type ProductListFilters = {
  category?: string;
  search?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function fetchProductCategoryNames() {
  await dbConnect();
  try {
    const names = await ProductModel.distinct("category", {
      isActive: { $ne: false },
    });
    const sorted = (names as string[]).filter(Boolean).sort((a, b) =>
      a.localeCompare(b),
    );
    return { success: true, names: sorted };
  } catch {
    return { success: false, names: [] as string[] };
  }
}

export async function fetchProducts(filters?: ProductListFilters) {
  await dbConnect();
  const query: Record<string, unknown> = {};
  if (filters?.category) query.category = filters.category;
  if (filters?.sellerId) query.sellerId = filters.sellerId;
  if (filters?.search) {
    const term = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
    ];
  }
  if (filters?.inStockOnly) {
    query.stock = { $gt: 0 };
  }
  const priceCond: Record<string, number> = {};
  if (filters?.minPrice != null && !Number.isNaN(filters.minPrice)) {
    priceCond.$gte = filters.minPrice;
  }
  if (filters?.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
    priceCond.$lte = filters.maxPrice;
  }
  if (Object.keys(priceCond).length) {
    query.price = priceCond;
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters?.sort === "price_asc") sort = { price: 1 };
  if (filters?.sort === "price_desc") sort = { price: -1 };

  try {
    const products = await ProductModel.find(query).sort(sort).lean();
    return { success: true, data: products };
  } catch {
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function createProduct(rawData: unknown) {
  const session = await requireAuth(["admin", "seller"]);
  const validated = ProductWriteSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const body =
      typeof rawData === "object" && rawData !== null
        ? (rawData as Record<string, unknown>)
        : {};
    let sellerObjectId: string;
    if (session.role === "admin") {
      const sid = typeof body.sellerId === "string" ? body.sellerId : "";
      if (!sid)
        return { success: false, error: "Seller is required for this product" };
      const seller = await SellerModel.findById(sid).select("_id").lean();
      if (!seller)
        return { success: false, error: "Invalid seller" };
      sellerObjectId = seller._id.toString();
    } else {
      const seller = await SellerModel.findOne({ userId: session.id })
        .select("_id")
        .lean();
      if (!seller)
        return { success: false, error: "Seller profile not found" };
      sellerObjectId = seller._id.toString();
    }

    const product = await ProductModel.create({
      ...validated.data,
      sellerId: sellerObjectId,
    });
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
    return { success: true, data: { id: product._id } };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(productId: string, rawData: unknown) {
  const session = await requireAuth(["admin", "seller"]);
  const validated = ProductUpdateSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };

  await dbConnect();
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return { success: false, error: "Product not found" };
    const seller = await SellerModel.findOne({ userId: session.id })
      .select("_id")
      .lean();
    const sellerOid = seller?._id.toString();
    if (session.role !== "admin") {
      if (!sellerOid || product.sellerId.toString() !== sellerOid) {
        return { success: false, error: "Unauthorized" };
      }
    }
    const updated = await ProductModel.findByIdAndUpdate(
      productId,
      validated.data,
      { new: true },
    );
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
    return { success: true, data: { id: updated!._id } };
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
    if (session.role !== "admin") {
      const seller = await SellerModel.findOne({ userId: session.id })
        .select("_id")
        .lean();
      const sellerOid = seller?._id.toString();
      if (!sellerOid || product.sellerId.toString() !== sellerOid) {
        return { success: false, error: "Unauthorized" };
      }
    }
    await ProductModel.findByIdAndUpdate(productId, { isActive });
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
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
    if (session.role !== "admin") {
      const seller = await SellerModel.findOne({ userId: session.id })
        .select("_id")
        .lean();
      const sellerOid = seller?._id.toString();
      if (!sellerOid || product.sellerId.toString() !== sellerOid) {
        return { success: false, error: "Unauthorized" };
      }
    }
    await ProductModel.findByIdAndUpdate(productId, { isActive: false });
    revalidatePath("/admin/products");
    revalidatePath("/seller/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete product" };
  }
}
