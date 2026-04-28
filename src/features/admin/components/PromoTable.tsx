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
import { PromoForm } from "./PromoForm";
import { toast } from "sonner";
import { togglePromoStatus } from "@/features/promo/promo-actions";
import { cn } from "@/lib/utils";

interface PromoDoc {
  _id: string;
  code: string;
  type: string;
  value: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export function PromoTable({ promos }: { promos: PromoDoc[] }) {
  const [search, setSearch] = useState("");
  const [selectedPromo, setSelectedPromo] = useState<PromoDoc | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const filtered = promos.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleToggle(id: string) {
    const res = await togglePromoStatus(id);
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
        <h2 className="text-2xl font-bold">Promo & Discount Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Promo
                </Button>
              }
            />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Promo</DialogTitle>
              </DialogHeader>
              <PromoForm
                onSuccess={() => {
                  router.refresh();
                  toast.success("Promo created");
                  setOpen(false);
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
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((promo) => (
              <TableRow
                key={promo._id}
                className={!promo.isActive ? "bg-muted/20" : ""}
              >
                <TableCell className="font-mono font-bold">
                  {promo.code}
                </TableCell>
                <TableCell className="capitalize">{promo.type}</TableCell>
                <TableCell>
                  {promo.type === "percent"
                    ? `${promo.value}%`
                    : `$${promo.value}`}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {promo.usedCount} / {promo.usageLimit || "∞"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(promo.endDate).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={promo.isActive ? "default" : "secondary"}
                    className={
                      promo.isActive
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : ""
                    }
                  >
                    {promo.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Open menu"
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg transition-all outline-none",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "hover:bg-muted disabled:opacity-50",
                            "size-7",
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    />

                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setSelectedPromo(promo);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Promo</DialogTitle>
                          </DialogHeader>
                          {selectedPromo && (
                            <PromoForm
                              initialData={
                                selectedPromo as Partial<{
                                  code: string;
                                  type: "fixed" | "percent" | "shipping";
                                  value: unknown;
                                  startDate: string;
                                  endDate: string;
                                  usageLimit?: unknown;
                                  usedCount?: number;
                                  isActive?: boolean;
                                }> & { _id?: string }
                              }
                              onSuccess={() => {
                                router.refresh();
                                toast.success("Promo updated");
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem onClick={() => handleToggle(promo._id)}>
                        <Power className="mr-2 h-4 w-4" />{" "}
                        {promo.isActive ? "Disable" : "Enable"}
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
