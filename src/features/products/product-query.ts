import dbConnect from "@/lib/db";
import ProductModel from "@/features/products/models/product.model";

export type ProductListFilters = {
  category?: string;
  search?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function queryProductList(filters?: ProductListFilters) {
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
    return { success: true as const, data: products };
  } catch {
    return { success: false as const, error: "Failed to fetch products" };
  }
}
