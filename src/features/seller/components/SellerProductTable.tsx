"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Edit, EyeOff, Eye } from "lucide-react";
import { SellerProductForm } from "./SellerProductForm";
import { toast } from "sonner";
import { toggleSellerProductStatus } from "@/features/seller/seller-product-actions";
import { cn } from "@/lib/utils";

interface ProductDoc {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export function SellerProductTable({
  products,
  categoryOptions,
}: {
  products: ProductDoc[];
  categoryOptions: { name: string }[];
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleToggle(id: string) {
    const res = await toggleSellerProductStatus(id);
    if (res.success) {
      toast.success("Status updated");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">My Products</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <Dialog>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              }
            />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <SellerProductForm
                categoryOptions={categoryOptions}
                onSuccess={() => {
                  router.refresh();
                  toast.success("Product created");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
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
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.stock < 10 ? "destructive" : "outline"}
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className={
                      product.isActive
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : ""
                    }
                  >
                    {product.isActive ? "Active" : "Inactive"}
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
                            "hover:bg-muted disabled:opacity-50",
                            "size-8",
                          )}
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/seller/products/${product._id}/edit`)
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggle(product._id)}
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
