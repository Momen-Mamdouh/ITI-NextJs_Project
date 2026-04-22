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
import { MoreHorizontal, Plus, Edit, Power } from "lucide-react";
import { SellerProductForm } from "./SellerProductForm";
import { toast } from "sonner";
import { toggleSellerProductStatus } from "@/features/seller/seller-product-actions";

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

export function SellerProductTable({ products }: { products: ProductDoc[] }) {
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
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <SellerProductForm
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
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
                            <SellerProductForm
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
                        onClick={() => handleToggle(product._id)}
                      >
                        <Power className="mr-2 h-4 w-4" />{" "}
                        {product.isActive ? "Deactivate" : "Activate"}
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
