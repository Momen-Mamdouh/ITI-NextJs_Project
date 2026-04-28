"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/features/user/models/user.model";
import ProductModel from "@/features/products/models/product.model";

const CartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
  price: z.number().min(0),
  name: z.string().min(1),
  image: z.string().optional().default(""),
  sellerId: z.string().min(1),
});

const CartArraySchema = z.array(CartLineSchema);

export type CartLineInput = z.infer<typeof CartLineSchema>;

function serializeCart(
  items: {
    productId: unknown;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    sellerId: unknown;
  }[],
): CartLineInput[] {
  return items.map((i) => ({
    productId: String(i.productId),
    quantity: i.quantity,
    price: i.price,
    name: i.name,
    image: i.image || "",
    sellerId: String(i.sellerId),
  }));
}

export async function getCustomerCart() {
  try {
    const session = await requireAuth(["customer"]);
    await dbConnect();
    const user = await UserModel.findById(session.id)
      .select("cartItems")
      .lean();
    const raw = (user?.cartItems as CartLineInput[] | undefined) ?? [];
    return { success: true, items: serializeCart(raw) };
  } catch {
    return { success: false, items: [] as CartLineInput[] };
  }
}

export async function saveCustomerCart(rawItems: unknown) {
  try {
    const session = await requireAuth(["customer"]);
    const validated = CartArraySchema.safeParse(rawItems);
    if (!validated.success)
      return { success: false, error: "Invalid cart", items: [] as CartLineInput[] };

    await dbConnect();
    const merged: CartLineInput[] = [];
    for (const line of validated.data) {
      const product = await ProductModel.findById(line.productId).lean();
      if (!product) continue;
      if (String(product.sellerId) !== line.sellerId) continue;
      const pid = String(product._id);
      const cap = product.stock;
      const qtyWanted = Math.min(line.quantity, 999, cap);
      if (qtyWanted < 1) continue;
      const price = product.price;
      const name = product.name;
      const image = product.images?.[0] || "";
      const sid = String(product.sellerId);
      const existing = merged.find((m) => m.productId === pid);
      if (existing) {
        existing.quantity = Math.min(999, existing.quantity + qtyWanted, cap);
        existing.price = price;
        existing.name = name;
        existing.image = image;
        existing.sellerId = sid;
      } else {
        merged.push({
          productId: pid,
          quantity: qtyWanted,
          price,
          name,
          image,
          sellerId: sid,
        });
      }
    }

    await UserModel.findByIdAndUpdate(session.id, {
      $set: { cartItems: merged },
    });
    return { success: true, items: merged };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return { success: false, error: message, items: [] as CartLineInput[] };
  }
}

/**
 * Pushes the guest (localStorage) cart into the database as the source of truth.
 * If the guest cart is empty, returns what is already stored for the customer.
 */
export async function mergeGuestCartIntoAccount(rawItems: unknown) {
  try {
    await requireAuth(["customer"]);
    const guestParsed = CartArraySchema.safeParse(rawItems);
    if (!guestParsed.success || guestParsed.data.length === 0) {
      return await getCustomerCart();
    }
    return await saveCustomerCart(guestParsed.data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to merge";
    return { success: false, error: message, items: [] as CartLineInput[] };
  }
}
