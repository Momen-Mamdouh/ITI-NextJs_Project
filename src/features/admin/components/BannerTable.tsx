"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  MoreHorizontal,
  Plus,
  Edit,
  Power,
  Image as ImageIcon,
} from "lucide-react";
import { BannerForm } from "./BannerForm";
import { toast } from "sonner";
import { toggleBannerStatus } from "@/features/content/content-actions";

type BannerPosition = "hero" | "category" | "sidebar" | "footer";
type BannerAudience = "all" | "customer" | "seller" | "admin";

interface BannerDoc {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  sortOrder: number;
  targetAudience: BannerAudience;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export function BannerTable({ banners }: { banners: BannerDoc[] }) {
  const [search, setSearch] = useState("");
  const [selectedBanner, setSelectedBanner] = useState<BannerDoc | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const filtered = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.position.includes(search.toLowerCase()),
  );

  async function handleToggle(id: string) {
    const res = await toggleBannerStatus(id);
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
        <h2 className="text-2xl font-bold">Banner & Content Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Banner</DialogTitle>
              </DialogHeader>
              <BannerForm
                onSuccess={() => {
                  router.refresh();
                  toast.success("Banner created");
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
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((banner) => (
              <TableRow
                key={banner._id}
                className={!banner.isActive ? "bg-muted/20" : ""}
              >
                <TableCell>
                  <div className="w-16 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {banner.imageUrl ? (
                      <Image
                        src={banner.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        width={64}
                        height={40}
                      />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{banner.position}</Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {banner.targetAudience}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={banner.isActive ? "default" : "secondary"}
                    className={
                      banner.isActive
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : ""
                    }
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {banner.startDate
                    ? new Date(banner.startDate).toLocaleDateString("en-US")
                    : "No start"}{" "}
                  →{" "}
                  {banner.endDate
                    ? new Date(banner.endDate).toLocaleDateString("en-US")
                    : "No end"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setSelectedBanner(banner);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Banner</DialogTitle>
                          </DialogHeader>
                          {selectedBanner && (
                            <BannerForm
                              initialData={selectedBanner}
                              onSuccess={() => {
                                router.refresh();
                                toast.success("Banner updated");
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem
                        onClick={() => handleToggle(banner._id)}
                      >
                        <Power className="mr-2 h-4 w-4" />{" "}
                        {banner.isActive ? "Disable" : "Enable"}
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
