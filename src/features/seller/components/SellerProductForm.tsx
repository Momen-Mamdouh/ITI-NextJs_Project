"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  createSellerProduct,
  updateSellerProduct,
} from "@/features/seller/seller-product-actions";
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
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof ProductFormSchema>;

interface ProductFormProps {
  categoryOptions: { name: string }[];
  initialData?: Partial<ProductFormValues> & { _id?: string };
  onSuccess: () => void;
}

const FALLBACK = [
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Accessories" },
];

export function SellerProductForm({
  categoryOptions,
  initialData,
  onSuccess,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      stock: initialData?.stock || 0,
      category: initialData?.category || "",
      images: initialData?.images || [""],
      isActive: initialData?.isActive ?? true,
    },
  });

  const categories =
    categoryOptions.length > 0 ? categoryOptions : FALLBACK;

  async function onSubmit(values: ProductFormValues) {
    setLoading(true);
    try {
      const result = initialData?._id
        ? await updateSellerProduct(initialData._id, values)
        : await createSellerProduct(values);

      if (result.success) {
        toast.success(initialData?._id ? "Updated" : "Created");
        form.reset();
        onSuccess();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
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
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="min-h-24" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
