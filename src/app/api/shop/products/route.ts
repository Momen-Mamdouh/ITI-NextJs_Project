import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { queryProductList } from "@/features/products/product-query";
import { parseProductListParams } from "@/lib/shop-filters";

export async function GET(request: NextRequest) {
  const entries = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  ) as Record<string, string | undefined>;
  const filters = parseProductListParams(entries);
  const result = await queryProductList(filters);
  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    products: JSON.parse(JSON.stringify(result.data)),
  });
}
