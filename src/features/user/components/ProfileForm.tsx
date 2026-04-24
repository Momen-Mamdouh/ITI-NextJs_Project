"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileSchema } from "@/features/user/schemas";
import { updateProfile } from "@/features/user/actions";
import { toast } from "sonner";

type ProfileValues = z.infer<typeof ProfileSchema>;

interface ProfileFormProps {
  defaultValues: {
    name: string;
    phone?: string;
    email: string;
    preferredLanguage?: string;
    role: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: defaultValues.name,
      phone: defaultValues.phone || "",
      preferredLanguage: defaultValues.preferredLanguage || "en",
    },
  });

  async function onSubmit(values: ProfileValues) {
    setLoading(true);
    setError(null);
    const result = await updateProfile(values);
    if (result.success) {
      toast.success("Profile updated successfully");
    } else {
      setError(
        result.errors
          ? Object.values(result.errors).flat().join(", ")
          : "Failed to update profile",
      );
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{defaultValues.email}</p>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="text-sm font-medium capitalize">{defaultValues.role}</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ProfileValues, "name">;
          }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ProfileValues, "phone">;
          }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+20 1xx xxx xxxx"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredLanguage"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ProfileValues, "preferredLanguage">;
          }) => (
            <FormItem>
              <FormLabel>Preferred Language</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
