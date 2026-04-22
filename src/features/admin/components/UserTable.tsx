"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateUserRole,
  toggleUserStatus,
} from "@/features/admin/admin-actions";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  role: string;
  isSoftDeleted: boolean;
  isVerified: boolean;
  createdAt: string;
}

export function UserTable({ users }: { users: UserDoc[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleRoleChange(userId: string, role: string) {
    setLoadingId(userId);
    const res = await updateUserRole({ userId, role });
    setLoadingId(null);
    if (res.success) {
      toast.success("Role updated successfully");
      router.refresh();
    } else {
      toast.error("Failed to update role");
    }
  }

  async function handleToggleStatus(userId: string, isSoftDeleted: boolean) {
    setLoadingId(userId);
    const res = await toggleUserStatus({ userId, isSoftDeleted });
    setLoadingId(null);
    if (res.success) {
      toast.success(isSoftDeleted ? "User restricted" : "User restored");
      router.refresh();
    } else {
      toast.error("Action failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user._id}
                className={user.isSoftDeleted ? "bg-muted/20" : ""}
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "destructive"
                        : user.role === "seller"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.isSoftDeleted ? "outline" : "default"}
                    className={
                      user.isSoftDeleted
                        ? ""
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  >
                    {user.isSoftDeleted ? "Restricted" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === user._id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user._id, "customer")}
                      >
                        Set Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user._id, "seller")}
                      >
                        Set Seller
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user._id, "admin")}
                      >
                        Set Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleStatus(user._id, !user.isSoftDeleted)
                        }
                        className={
                          user.isSoftDeleted ? "text-green-600" : "text-red-600"
                        }
                      >
                        {user.isSoftDeleted ? "Restore User" : "Restrict User"}
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
