"use server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/features/user/models/user.model";
import { revalidatePath } from "next/cache";

const UpdateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["customer", "seller", "admin"]),
});

const ToggleStatusSchema = z.object({
  userId: z.string().min(1),
  isSoftDeleted: z.boolean(),
});

export async function fetchUsers() {
  await requireAuth(["admin"]);
  await dbConnect();
  try {
    const users = await UserModel.find({}, { passwordHash: 0, savedCards: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(users)) };
  } catch {
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = UpdateRoleSchema.safeParse(rawData);
  if (!validated.success) return { success: false, error: "Invalid input" };

  await dbConnect();
  try {
    const { userId, role } = validated.data;
    await UserModel.findByIdAndUpdate(userId, { role });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update role" };
  }
}

export async function toggleUserStatus(rawData: unknown) {
  await requireAuth(["admin"]);
  const validated = ToggleStatusSchema.safeParse(rawData);
  if (!validated.success) return { success: false, error: "Invalid input" };

  await dbConnect();
  try {
    const { userId, isSoftDeleted } = validated.data;
    await UserModel.findByIdAndUpdate(userId, { isSoftDeleted });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}
