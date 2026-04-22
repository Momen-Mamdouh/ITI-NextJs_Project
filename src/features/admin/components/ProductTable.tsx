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

interface ProductDoc {
  _id: string;
  name: string;
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
  sellerId,
}: {
  products: ProductDoc[];
  sellerId: string;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDoc | null>(
    null,
  );
  const router = useRouter();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog>
            <DialogTrigger>
              <Button>Create Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.stock < 10
                        ? "destructive"
                        : product.stock < 50
                          ? "secondary"
                          : "default"
                    }
                  >
                    {product.stock} {product.stock < 10 && "(Low)"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.isActive ? "default" : "outline"}
                    className={
                      product.isActive
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : ""
                    }
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
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
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          {selectedProduct && (
                            <ProductForm
                              sellerId={sellerId}
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
