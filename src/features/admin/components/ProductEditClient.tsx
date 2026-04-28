"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/features/admin/components/ProductForm";

export function ProductEditClient({
  product,
  categoryOptions,
  adminSellers,
  sessionRole,
}: {
  product: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    category: string;
    images: string[];
    isActive?: boolean;
  };
  categoryOptions: { name: string }[];
  adminSellers?: { id: string; label: string }[];
  sessionRole: "admin" | "seller";
}) {
  const router = useRouter();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update details for {product.name}
          </p>
        </div>
      </div>

      <ProductForm
        categoryOptions={categoryOptions}
        variant={sessionRole === "admin" ? "admin" : "seller"}
        adminSellers={sessionRole === "admin" ? adminSellers : undefined}
        initialData={{
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          category: product.category,
          images: product.images,
          isActive: product.isActive ?? true,
        }}
        onSuccess={() => {
          toast.success("Product updated");
          router.push("/admin/products");
          router.refresh();
        }}
      />
    </div>
  );
}

