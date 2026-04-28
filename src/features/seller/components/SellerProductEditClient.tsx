"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SellerProductForm } from "@/features/seller/components/SellerProductForm";

type ProductDoc = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
};

export function SellerProductEditClient({
  product,
  categoryOptions,
}: {
  product: ProductDoc;
  categoryOptions: { name: string }[];
}) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit product</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <div className="rounded-lg border bg-background p-4">
        <SellerProductForm
          categoryOptions={categoryOptions}
          initialData={product}
          onSuccess={() => {
            toast.success("Product updated");
            router.push("/seller/products");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}

