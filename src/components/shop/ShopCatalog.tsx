"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ProductCard, type ProductView } from "@/components/shop/ProductCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { serializeProductFilters } from "@/lib/shop-filters";
import type { ProductListFilters } from "@/features/products/product-query";

function toView(p: unknown): ProductView {
  const x = p as {
    _id: unknown;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    stock: number;
    category: string;
    sellerId: unknown;
    isActive?: boolean;
  };
  return {
    _id: String(x._id),
    name: x.name,
    description: x.description,
    price: x.price,
    compareAtPrice: x.compareAtPrice,
    images: x.images,
    stock: x.stock,
    category: x.category,
    sellerId: String(x.sellerId),
    isActive: x.isActive,
  };
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function filtersFromShopState(state: {
  searchDraft: string;
  category: string;
  sort: NonNullable<ProductListFilters["sort"]>;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  debouncedSearch: string;
}): ProductListFilters {
  const min = state.minPrice.trim() === "" ? undefined : Number(state.minPrice);
  const max = state.maxPrice.trim() === "" ? undefined : Number(state.maxPrice);
  return {
    search: state.debouncedSearch.trim() || undefined,
    category: state.category.trim() || undefined,
    sort: state.sort,
    minPrice: min !== undefined && !Number.isNaN(min) ? min : undefined,
    maxPrice: max !== undefined && !Number.isNaN(max) ? max : undefined,
    inStockOnly: state.inStockOnly || undefined,
  };
}

function initialShopState(f: Partial<ProductListFilters> = {}) {
  return {
    searchDraft: f.search ?? "",
    category: f.category ?? "",
    sort: (f.sort ?? "newest") as NonNullable<ProductListFilters["sort"]>,
    minPrice: f.minPrice != null ? String(f.minPrice) : "",
    maxPrice: f.maxPrice != null ? String(f.maxPrice) : "",
    inStockOnly: Boolean(f.inStockOnly),
  };
}

function stableFilterKey(filters: ProductListFilters): string {
  return JSON.stringify({
    search: filters.search ?? null,
    category: filters.category ?? null,
    minPrice: filters.minPrice ?? null,
    maxPrice: filters.maxPrice ?? null,
    inStockOnly: filters.inStockOnly ?? false,
    sort: filters.sort ?? "newest",
  });
}

async function fetchProductsJson(
  filters: ProductListFilters,
): Promise<ProductView[]> {
  const qs = serializeProductFilters(filters);
  const res = await fetch(`/api/shop/products?${qs}`, { credentials: "same-origin" });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = (await res.json()) as { products?: unknown[] };
  const raw = data.products ?? [];
  return raw.map(toView);
}

type ShopCatalogProps = {
  categoryNames: string[];
  initialFilters: ProductListFilters;
  initialProducts: ProductView[];
  /** True when the catalog is empty before any client-side filtering. */
  storeEmpty: boolean;
};

export function ShopCatalog({
  categoryNames,
  initialFilters,
  initialProducts,
  storeEmpty,
}: ShopCatalogProps) {
  const [shop, setShop] = useState(() => initialShopState(initialFilters));
  const debouncedSearch = useDebouncedValue(shop.searchDraft, 350);

  const apiFilters = useMemo(
    () =>
      filtersFromShopState({
        ...shop,
        debouncedSearch,
      }),
    [
      shop.category,
      shop.sort,
      shop.minPrice,
      shop.maxPrice,
      shop.inStockOnly,
      debouncedSearch,
    ],
  );

  const queryKey = useMemo(
    () => ["shop-products", apiFilters] as const,
    [apiFilters],
  );

  const matchesServer =
    stableFilterKey(apiFilters) === stableFilterKey(initialFilters);

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchProductsJson(apiFilters),
    initialData: matchesServer ? initialProducts : undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const products = data ?? [];

  function resetFilters() {
    setShop(initialShopState({}));
  }

  const hasActiveFilters =
    shop.searchDraft.trim() !== "" ||
    shop.category !== "" ||
    shop.sort !== "newest" ||
    shop.minPrice.trim() !== "" ||
    shop.maxPrice.trim() !== "" ||
    shop.inStockOnly;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shop-search">Search</Label>
            <Input
              id="shop-search"
              type="search"
              placeholder="Product name or description…"
              value={shop.searchDraft}
              onChange={(e) =>
                setShop((s) => ({ ...s, searchDraft: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-category">Category</Label>
            <select
              id="shop-category"
              value={shop.category}
              onChange={(e) =>
                setShop((s) => ({ ...s, category: e.target.value }))
              }
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">All categories</option>
              {categoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-sort">Sort</Label>
            <select
              id="shop-sort"
              value={shop.sort}
              onChange={(e) =>
                setShop((s) => ({
                  ...s,
                  sort: (e.target.value || "newest") as NonNullable<
                    ProductListFilters["sort"]
                  >,
                }))
              }
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="shop-min">Min price</Label>
            <Input
              id="shop-min"
              type="number"
              step="0.01"
              min={0}
              placeholder="0"
              value={shop.minPrice}
              onChange={(e) =>
                setShop((s) => ({ ...s, minPrice: e.target.value }))
              }
              className="w-28"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-max">Max price</Label>
            <Input
              id="shop-max"
              type="number"
              step="0.01"
              min={0}
              placeholder="Any"
              value={shop.maxPrice}
              onChange={(e) =>
                setShop((s) => ({ ...s, maxPrice: e.target.value }))
              }
              className="w-28"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              id="shop-instock"
              type="checkbox"
              checked={shop.inStockOnly}
              onChange={(e) =>
                setShop((s) => ({ ...s, inStockOnly: e.target.checked }))
              }
              className="size-4 rounded border-input"
            />
            <Label htmlFor="shop-instock" className="text-sm font-normal">
              In stock only
            </Label>
          </div>
          {hasActiveFilters ? (
            <div className="pb-0.5 sm:ms-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {storeEmpty && !hasActiveFilters
            ? "No products yet. Add some from the seller or admin area."
            : "No products match these filters."}
        </p>
      ) : (
        <div
          className={cn(
            "grid w-full grid-cols-1 gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isFetching && "opacity-70",
          )}
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
