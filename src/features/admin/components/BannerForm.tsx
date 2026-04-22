"use client";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createBanner, updateBanner } from "@/features/content/content-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";

const BannerFormSchema = z.object({
  title: z.string().min(2).max(100),
  subtitle: z.string().max(200).optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().optional(),
  position: z.enum(["hero", "category", "sidebar", "footer"]),
  sortOrder: z.number().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.enum(["all", "customer", "seller", "admin"]),
  language: z.string(),
  isActive: z.boolean(),
});
type BannerFormValues = z.infer<typeof BannerFormSchema>;

interface BannerFormProps {
  initialData?: Partial<BannerFormValues> & { _id?: string };
  onSuccess?: () => void;
}

export function BannerForm({ initialData, onSuccess }: BannerFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      subtitle: initialData?.subtitle ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      linkUrl: initialData?.linkUrl ?? "",
      position: initialData?.position ?? "hero",
      sortOrder: initialData?.sortOrder ?? 0,
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
      targetAudience: initialData?.targetAudience ?? "all",
      language: initialData?.language ?? "en",
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit: SubmitHandler<BannerFormValues> = async (values) => {
    setLoading(true);
    try {
      const result = initialData?._id
        ? await updateBanner(initialData._id, values)
        : await createBanner(values);
      if (result.success) {
        toast.success(initialData?._id ? "Banner updated" : "Banner created");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any).errors?.imageUrl?.[0] || result.error || "Failed",
        );
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
        className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Summer Sale" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/banner.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://store.com/deals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="seller">Sellers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Publish immediately</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : initialData?._id
                ? "Update Banner"
                : "Create Banner"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
