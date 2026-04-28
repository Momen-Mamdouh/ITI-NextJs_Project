"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  toggleProductStatus,
  softDeleteProduct,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
  const [selectedProduct, setSelectedProduct] = useState<ProductDoc | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();

  const q = search.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false),
  );

  async function handleToggleStatus(productId: string, isActive: boolean) {
    setLoadingId(productId);
    const res = await toggleProductStatus(productId, !isActive);
    setLoadingId(null);
    if (res.success) {
      toast.success(isActive ? "Product deactivated" : "Product activated");
      router.refresh();
    } else {
      toast.error("Action failed");
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Soft delete this product?")) return;
    setLoadingId(productId);
    const res = await softDeleteProduct(productId);
    setLoadingId(null);
    if (res.success) {
      toast.success("Product deleted");
      router.refresh();
    } else {
      toast.error("Delete failed");
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

      <div className="border rounded-lg bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="min-w-50">Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow
                key={product._id}
                className={!product.isActive ? "bg-muted/20" : ""}
              >
                <TableCell className="font-medium align-top">
                  <div className="flex items-start gap-3 max-w-55">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={44}
                        height={44}
                        className="rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-11 shrink-0 rounded-md bg-muted" />
                    )}
                    <span className="line-clamp-3 text-sm leading-snug">
                      {product.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="align-top text-muted-foreground text-xs">
                  <p className="line-clamp-3 max-w-xs">
                    {product.description ?? "—"}
                  </p>
                </TableCell>
                <TableCell className="align-top">{product.category}</TableCell>
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
                <TableCell className="align-top">
                  <Badge
                    variant={product.isActive ? "default" : "outline"}
                    className={
                      product.isActive
                        ? "bg-green-600 hover:bg-green-600 text-white"
                        : ""
                    }
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === product._id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setSelectedProduct(product);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          {selectedProduct && (
                            <ProductForm
                              key={selectedProduct._id}
                              categoryOptions={categoryOptions}
                              variant={formVariant}
                              adminSellers={
                                formVariant === "admin"
                                  ? adminSellers
                                  : undefined
                              }
                              initialData={selectedProduct}
                              onSuccess={() => {
                                router.refresh();
                                toast.success("Product updated");
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleStatus(product._id, product.isActive)
                        }
                      >
                        {product.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product._id)}
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
