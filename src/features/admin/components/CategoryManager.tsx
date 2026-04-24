"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
} from "@/features/category/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export function CategoryManager({ initial }: { initial: CategoryRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setPending(true);
    try {
      const res = await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      if (res.success) {
        toast.success("Category created");
        setName("");
        setDescription("");
        router.refresh();
      } else if ("errors" in res && res.errors) {
        toast.error("Check the form fields");
      } else {
        toast.error("error" in res ? String(res.error) : "Failed");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products keep their category text."))
      return;
    setDeletingId(id);
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success("Category deleted");
        router.refresh();
      } else {
        toast.error("error" in res ? String(res.error) : "Failed");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage catalog categories. Product forms list active categories; you
          can add new ones here before assigning products.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="max-w-xl space-y-4 rounded-lg border border-border bg-card p-4"
      >
        <h3 className="font-semibold">Add category</h3>
        <div className="space-y-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-desc">Description (optional)</Label>
          <Textarea
            id="cat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short internal note"
            rows={2}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create category"}
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  No categories yet. Run seed in dev or create one above.
                </TableCell>
              </TableRow>
            ) : (
              initial.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isActive === false ? "secondary" : "default"}>
                      {c.isActive === false ? "Inactive" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={deletingId === c._id}
                      onClick={() => void handleDelete(c._id)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
