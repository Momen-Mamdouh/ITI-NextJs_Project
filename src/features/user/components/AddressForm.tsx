"use client";

import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressSchema } from "@/features/user/schemas";
import { addAddress, updateAddress } from "@/features/user/actions";
import { toast } from "sonner";

type AddressValues = z.infer<typeof AddressSchema>;

interface AddressFormProps {
  address?: AddressValues & { _id?: string };
  onDone?: () => void;
}

export function AddressForm({ address, onDone }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!address?._id;

  const form = useForm<AddressValues>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      label: address?.label || "Home",
      fullName: address?.fullName || "",
      addressLine1: address?.addressLine1 || "",
      addressLine2: address?.addressLine2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.postalCode || "",
      country: address?.country || "EG",
      phone: address?.phone || "",
      isDefault: address?.isDefault || false,
    },
  });

  async function onSubmit(values: AddressValues) {
    setLoading(true);
    const result = isEditing
      ? await updateAddress(address!._id!, values)
      : await addAddress(values);

    if (result.success) {
      toast.success(isEditing ? "Address updated" : "Address added");
      onDone?.();
    } else {
      toast.error("Failed to save address");
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="label"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "label">;
            }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder="Home, Work..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "fullName">;
            }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Recipient name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addressLine1"
          render={({
            field,
          }: {
            field: ControllerRenderProps<AddressValues, "addressLine1">;
          }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Street address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine2"
          render={({
            field,
          }: {
            field: ControllerRenderProps<AddressValues, "addressLine2">;
          }) => (
            <FormItem>
              <FormLabel>Address Line 2 (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Apt, suite, floor..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "city">;
            }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Cairo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "state">;
            }) => (
              <FormItem>
                <FormLabel>State / Governorate</FormLabel>
                <FormControl>
                  <Input placeholder="Cairo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "postalCode">;
            }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="11511" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({
              field,
            }: {
              field: ControllerRenderProps<AddressValues, "country">;
            }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="EG" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({
            field,
          }: {
            field: ControllerRenderProps<AddressValues, "phone">;
          }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+20 1xx xxx xxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({
            field,
          }: {
            field: ControllerRenderProps<AddressValues, "isDefault">;
          }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Set as default address</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Address" : "Add Address"}
          </Button>
          {onDone && (
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
