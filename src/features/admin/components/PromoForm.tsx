"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createPromo, updatePromo } from "@/features/promo/promo-actions";
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

const PromoFormSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(50),
  description: z.string().max(200).optional(),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isActive: z.boolean().default(true),
  applicableRoles: z.array(z.enum(["customer", "seller", "admin"])).optional(),
  applicableCategories: z.string().optional(),
  applicableSellers: z.string().optional(),
});

type PromoFormValues = z.input<typeof PromoFormSchema>;
type PromoFormOutput = z.output<typeof PromoFormSchema>;

interface PromoFormProps {
  initialData?: Partial<PromoFormValues> & { _id?: string; usedCount?: number };
  onSuccess?: () => void;
}

export function PromoForm({ initialData, onSuccess }: PromoFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<PromoFormValues, unknown, PromoFormOutput>({
    resolver: zodResolver(PromoFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      type: initialData?.type || "percent",
      value: initialData?.value ?? "",
      minOrderValue: initialData?.minOrderValue ?? "",
      maxDiscount: initialData?.maxDiscount ?? undefined,
      usageLimit: initialData?.usageLimit ?? undefined,
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      isActive: initialData?.isActive ?? true,
      applicableCategories: initialData?.applicableCategories || "",
      applicableSellers: initialData?.applicableSellers || "",
    },
  });
  async function onSubmit(values: PromoFormOutput) {
    setLoading(true);

    try {
      const payload = {
        ...values,
        applicableCategories: values.applicableCategories
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        applicableSellers: values.applicableSellers
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const result = initialData?._id
        ? await updatePromo(initialData._id, payload)
        : await createPromo(payload);

      if (result.success) {
        toast.success(initialData?._id ? "Promo updated" : "Promo created");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed");
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
        className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promo Code</FormLabel>
                <FormControl>
                  <Input placeholder="SUMMER2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
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
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as string | number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minOrderValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Order ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as string | number}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Discount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value as string | number}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          name="usageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Limit (Leave empty for unlimited)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value as string | number}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="applicableCategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Categories (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="electronics, clothing" {...field} />
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
                <Textarea placeholder="Terms & conditions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : initialData?._id
                ? "Update Promo"
                : "Create Promo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
