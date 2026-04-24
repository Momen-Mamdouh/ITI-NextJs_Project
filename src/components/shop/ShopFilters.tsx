import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProductListFilters } from "@/features/products/product-actions";

type ShopFiltersProps = {
  categoryNames: string[];
  active: ProductListFilters;
};

export function ShopFilters({ categoryNames, active }: ShopFiltersProps) {
  return (
    <form
      method="get"
      action="/"
      className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="shop-search">Search</Label>
          <Input
            id="shop-search"
            name="search"
            type="search"
            placeholder="Product name or description…"
            defaultValue={active.search ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shop-category">Category</Label>
          <select
            id="shop-category"
            name="category"
            defaultValue={active.category ?? ""}
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
            name="sort"
            defaultValue={active.sort ?? "newest"}
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
            name="minPrice"
            type="number"
            step="0.01"
            min={0}
            placeholder="0"
            defaultValue={
              active.minPrice != null ? String(active.minPrice) : ""
            }
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shop-max">Max price</Label>
          <Input
            id="shop-max"
            name="maxPrice"
            type="number"
            step="0.01"
            min={0}
            placeholder="Any"
            defaultValue={
              active.maxPrice != null ? String(active.maxPrice) : ""
            }
            className="w-28"
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            id="shop-instock"
            name="inStock"
            type="checkbox"
            value="1"
            defaultChecked={Boolean(active.inStockOnly)}
            className="size-4 rounded border-input"
          />
          <Label htmlFor="shop-instock" className="text-sm font-normal">
            In stock only
          </Label>
        </div>
        <div className="flex flex-wrap gap-2 pb-0.5 sm:ms-auto">
          <Button type="submit" size="sm">
            Apply filters
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex",
            )}
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
