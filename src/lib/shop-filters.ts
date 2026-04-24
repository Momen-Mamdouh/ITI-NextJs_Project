import type { ProductListFilters } from "@/features/products/product-actions";

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
