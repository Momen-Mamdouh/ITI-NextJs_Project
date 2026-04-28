import type { ProductListFilters } from "@/features/products/product-query";

export type ShopSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function parseProductListParams(
  sp: ShopSearchParams,
): ProductListFilters {
  const search = first(sp.search)?.trim() || undefined;
  const category = first(sp.category)?.trim() || undefined;
  const minRaw = first(sp.minPrice);
  const maxRaw = first(sp.maxPrice);
  const minPrice =
    minRaw !== undefined && minRaw !== "" ? Number(minRaw) : undefined;
  const maxPrice =
    maxRaw !== undefined && maxRaw !== "" ? Number(maxRaw) : undefined;
  const inStockRaw = first(sp.inStock);
  const inStockOnly = inStockRaw === "1" || inStockRaw === "true";
  const sortRaw = first(sp.sort);
  const sort =
    sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "newest"
      ? sortRaw
      : "newest";

  return {
    search,
    category,
    minPrice:
      minPrice !== undefined && !Number.isNaN(minPrice) ? minPrice : undefined,
    maxPrice:
      maxPrice !== undefined && !Number.isNaN(maxPrice) ? maxPrice : undefined,
    inStockOnly: inStockOnly || undefined,
    sort,
  };
}

export function serializeProductFilters(f: ProductListFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set("search", f.search);
  if (f.category) p.set("category", f.category);
  if (f.minPrice != null && !Number.isNaN(f.minPrice))
    p.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null && !Number.isNaN(f.maxPrice))
    p.set("maxPrice", String(f.maxPrice));
  if (f.inStockOnly) p.set("inStock", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  return p.toString();
}
