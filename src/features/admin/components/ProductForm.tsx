"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
} from "@/features/products/product-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().pipe(z.number().positive("Price must be positive")),
  compareAtPrice: z
    .union([z.coerce.number().positive(), z.literal("")])
    .optional(),
  stock: z.coerce
    .number()
    .pipe(z.number().int().min(0, "Stock cannot be negative")),
  category: z.string().min(1, "Category is required"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image required"),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.input<typeof ProductFormSchema>;

interface ProductFormProps {
  categoryOptions: { name: string }[];
  variant: "admin" | "seller";
  adminSellers?: { id: string; label: string }[];
  initialData?: Partial<ProductFormValues> & { _id?: string };
  onSuccess?: () => void;
}

const FALLBACK_CATEGORIES = [
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Accessories" },
  { name: "Home & Garden" },
];

export function ProductForm({
  categoryOptions,
  variant,
  adminSellers,
  initialData,
  onSuccess,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [adminSellerId, setAdminSellerId] = useState(
    () => adminSellers?.[0]?.id ?? "",
  );

  useEffect(() => {
    if (variant === "admin" && adminSellers?.length) {
      setAdminSellerId((prev) => {
        if (prev && adminSellers.some((s) => s.id === prev)) return prev;
        return adminSellers[0].id;
      });
    }
  }, [variant, adminSellers]);

  const categories =
    categoryOptions.length > 0 ? categoryOptions : FALLBACK_CATEGORIES;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ?? "",
      compareAtPrice: initialData?.compareAtPrice ?? "",
      stock: initialData?.stock ?? "",
      category: initialData?.category || "",
      images: initialData?.images?.length ? initialData.images : [""],
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    const parsed = ProductFormSchema.parse(values);

    if (variant === "admin" && !initialData?._id) {
      if (!adminSellerId) {
        toast.error("Select a seller for this product");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = { ...parsed };
      if (variant === "admin" && !initialData?._id) {
        payload.sellerId = adminSellerId;
      }

      const result = initialData?._id
        ? await updateProduct(initialData._id, payload)
        : await createProduct(payload);

      if (result.success) {
        toast.success(initialData?._id ? "Product updated" : "Product created");
        form.reset();
        onSuccess?.();
      } else {
        if ("errors" in result && result.errors) {
          toast.error("Please fix validation errors");
        } else {
          toast.error(
            "error" in result && result.error
              ? String(result.error)
              : "Operation failed",
          );
        }
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
      >
        {variant === "admin" && !initialData?._id && adminSellers?.length ? (
          <div className="space-y-2">
            <FormLabel>Seller</FormLabel>
            <Select
              value={adminSellerId}
              onValueChange={(v) => {
                if (v) setAdminSellerId(v);
              }}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select seller" />
              </SelectTrigger>
              <SelectContent>
                {adminSellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-25"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value as string | number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare At ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value as string | number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as string | number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URLs</FormLabel>
              <div className="space-y-2">
                {field.value.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={url}
                      onChange={(e) => {
                        const newImages = [...field.value];
                        newImages[index] = e.target.value;
                        field.onChange(newImages);
                      }}
                    />
                    {field.value.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newImages = field.value.filter(
                            (_, i) => i !== index,
                          );
                          field.onChange(newImages);
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => field.onChange([...field.value, ""])}
                >
                  + Add Image
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : initialData?._id
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
