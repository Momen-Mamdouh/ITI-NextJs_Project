"use server";

import {
  LoginSchema,
  RegisterSchema,
  hashPassword,
  verifyPassword,
  createTokens,
  setSessionCookies,
  clearSessionCookies,
  refreshSession,
} from "@/lib/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/features/user/models/user.model";
import SellerModel from "@/features/seller/models/seller.model";

export async function registerUser(rawData: unknown) {
  await dbConnect();
  const validated = RegisterSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  const { email, password, name, role } = validated.data;
  const existing = await UserModel.findOne({ email });
  if (existing)
    return { success: false, errors: { email: ["Email already registered"] } };
  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    passwordHash,
    role: role || "customer",
  });
  if (role === "seller") {
    await SellerModel.create({ userId: user._id, storeName: name });
  }
  const tokens = await createTokens({
    id: user._id.toString(),
    role: user.role,
  });
  await setSessionCookies(tokens.access, tokens.refresh);
  return {
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

export async function loginUser(rawData: unknown) {
  await dbConnect();
  const validated = LoginSchema.safeParse(rawData);
  if (!validated.success)
    return { success: false, errors: validated.error.flatten().fieldErrors };
  const { email, password } = validated.data;
  const user = await UserModel.findOne({ email }).select("+passwordHash");
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return {
      success: false,
      errors: { credentials: ["Invalid email or password"] },
    };
  }
  if (user.isSoftDeleted)
    return {
      success: false,
      errors: { account: ["Account has been deactivated"] },
    };
  const tokens = await createTokens({
    id: user._id.toString(),
    role: user.role,
  });
  await setSessionCookies(tokens.access, tokens.refresh);
  return {
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

export async function logoutUser() {
  await clearSessionCookies();
  return { success: true };
}

export async function refreshAuthSession() {
  try {
    const { access } = await refreshSession();
    return { success: true, accessToken: access };
  } catch {
    return { success: false, error: "Session expired" };
  }
}
