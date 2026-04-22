"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateSellerProfile } from "@/features/seller/seller-actions";
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

const ProfileFormSchema = z.object({
  storeName: z.string().min(3).max(100),

  description: z.string().max(500).optional(),

  logo: z.url().optional(),
  banner: z.url().optional(),

  payoutEmail: z.string().email().optional(),
  bankAccountLast4: z.string().length(4).optional(),
});
type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

interface SellerProfile {
  storeName?: string;
  description?: string;
  logo?: string;
  banner?: string;
  payoutEmail?: string;
  bankAccountLast4?: string;
}

interface ProfileFormProps {
  initialData?: SellerProfile;
  onSuccess: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      storeName: initialData?.storeName ?? "",
      description: initialData?.description ?? "",
      logo: initialData?.logo ?? undefined,
      banner: initialData?.banner ?? undefined,
      payoutEmail: initialData?.payoutEmail ?? "",
      bankAccountLast4: initialData?.bankAccountLast4 ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setLoading(true);
    try {
      const result = await updateSellerProfile(values);
      if (result.success) {
        toast.success("Profile updated successfully");
        form.reset(values);
        onSuccess();
      } else {
        if (!result.success) {
          if ("errors" in result) {
            toast.error(result.errors?.storeName?.[0] ?? "Update failed");
          } else {
            toast.error(result.error ?? "Update failed");
          }
        }
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="TechGear Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payoutEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payout Email</FormLabel>
                <FormControl>
                  <Input placeholder="vendor@example.com" {...field} />
                </FormControl>
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
              <FormLabel>Store Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your products and brand..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/logo.png"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner URL</FormLabel>
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
        </div>
        <FormField
          control={form.control}
          name="bankAccountLast4"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>Bank Account (Last 4 digits)</FormLabel>
              <FormControl>
                <Input placeholder="1234" maxLength={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
