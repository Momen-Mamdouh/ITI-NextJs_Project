"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteProductPermanently,
  toggleProductStatus,
} from "@/features/products/product-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { cn } from "@/lib/utils";

interface ProductDoc {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  sellerId: string;
  createdAt: string;
}

export function ProductTable({
  products,
  categoryOptions,
  sessionRole,
  adminSellers,
}: {
  products: ProductDoc[];
  categoryOptions: { name: string }[];
  sessionRole: "admin" | "seller";
  adminSellers?: { id: string; label: string }[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDoc | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const router = useRouter();

  const q = search.toLowerCase();
  const filtered = products
    .filter((p) => !deletedIds.has(p._id))
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false),
    );

  async function confirmDelete() {
    const id = deleteTarget?._id;
    if (!id) return;
    setLoadingId(id);
    const res = await deleteProductPermanently(id);
    setLoadingId(null);
    if (res.success) {
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setDeleteOpen(false);
      setDeleteTarget(null);
      toast.success("Product deleted");
      router.refresh();
    } else {
      toast.error(res.error || "Delete failed");
    }
  }

  async function handleToggleStatus(product: ProductDoc) {
    setLoadingId(product._id);
    const res = await toggleProductStatus(product._id, !product.isActive);
    setLoadingId(null);
    if (res.success) {
      toast.success(product.isActive ? "Product deactivated" : "Product activated");
      router.refresh();
    } else {
      toast.error(res.error || "Status update failed");
    }
  }

  const formVariant = sessionRole === "admin" ? "admin" : "seller";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search name, category, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs min-w-50"
          />
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create Product
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            categoryOptions={categoryOptions}
            variant={formVariant}
            adminSellers={formVariant === "admin" ? adminSellers : undefined}
            onSuccess={() => {
              setCreateOpen(false);
              router.refresh();
              toast.success("Product created");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently delete the product (cannot be undone).
              {deleteTarget ? ` (${deleteTarget.name})` : ""}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={Boolean(loadingId)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={Boolean(loadingId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editing moved to dedicated page */}

      <div className="border rounded-lg bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="min-w-50">Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="font-medium align-top">
                  <span className="line-clamp-2 text-sm leading-snug">
                    {product.name}
                  </span>
                </TableCell>
                <TableCell className="align-top text-muted-foreground text-xs">
                  <p className="line-clamp-3 max-w-xs">
                    {product.description ?? "—"}
                  </p>
                </TableCell>
                <TableCell className="align-top">{product.category}</TableCell>
                <TableCell className="align-top">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="align-top whitespace-nowrap">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell className="align-top">
                  <Badge
                    variant={
                      product.stock <= 0
                        ? "outline"
                        : product.stock < 10
                          ? "destructive"
                          : product.stock < 50
                            ? "secondary"
                            : "default"
                    }
                    className={cn(
                      product.stock <= 0 && "text-muted-foreground",
                    )}
                  >
                    {product.stock <= 0
                      ? "Out of stock"
                      : `${product.stock}${product.stock < 10 ? " (Low)" : ""}`}
                  </Badge>
                </TableCell>

                <TableCell className="text-right align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg transition-all outline-none",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                            "size-8",
                          )}
                          disabled={loadingId === product._id}
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => void handleToggleStatus(product)}
                      >
                        {product.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/products/${product._id}/edit`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteTarget(product);
                          setDeleteOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
