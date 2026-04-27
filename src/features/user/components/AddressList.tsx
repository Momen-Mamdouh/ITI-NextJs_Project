"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AddressForm } from "./AddressForm";
import { deleteAddress } from "@/features/user/actions";
import { toast } from "sonner";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface AddressListProps {
  addresses: Address[];
}

export function AddressList({ addresses }: AddressListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteAddress(id);
    if (result.success) {
      toast.success("Address deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete address");
    }
    setDeleting(null);
  }

  function handleDone() {
    setShowForm(false);
    setEditingId(null);
    router.refresh();
  }

  if (showForm || editingId) {
    const editAddr = editingId
      ? addresses.find((a) => a._id === editingId)
      : undefined;
    return (
      <AddressForm
        address={editAddr}
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setShowForm(true)}
      >
        <Plus className="size-4" />
        Add New Address
      </Button>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <MapPin className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No addresses yet</p>
          <p className="text-xs text-muted-foreground/70">
            Add a shipping address to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr._id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{addr.label}</span>
                  {addr.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{addr.fullName}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p>{addr.phone}</p>}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setEditingId(addr._id)}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    disabled={deleting === addr._id}
                    onClick={() => handleDelete(addr._id)}
                  >
                    <Trash2 className="size-3" />
                    {deleting === addr._id ? "..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
