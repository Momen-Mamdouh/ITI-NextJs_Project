"use server";

import { z } from "zod";
import dbConnect from "@/lib/db";
import ProductModel from "@/features/products/models/product.model";
import OrderModel from "@/features/orders/models/order.model";
import UserModel from "@/features/user/models/user.model";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/token";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

const ShippingSchema = z.object({
  fullName: z.string().min(2),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  phone: z.string().optional(),
});

const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
  price: z.number().min(0),
  name: z.string().min(1),
  image: z.string().optional().default(""),
  sellerId: z.string().min(1),
});

const PlaceOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart is empty"),
  shippingAddress: ShippingSchema,
  paymentMethod: z.enum(["stripe", "cod", "wallet"]),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(2).optional(),
  notes: z.string().max(500).optional(),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

async function getOptionalSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    const session = await verifyToken(token);
    return session ?? null;
  } catch {
    return null;
  }
}

async function validateCartItems(
  items: z.infer<typeof CartItemSchema>[],
) {
  const orderItems: {
    productId: string;
    sellerId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    discount: number;
  }[] = [];

  let subtotal = 0;

  for (const item of items) {
    const product = await ProductModel.findById(item.productId);
    if (!product) {
      return { error: `Product "${item.name}" no longer exists` };
    }
    if (!product.isActive) {
      return { error: `Product "${product.name}" is no longer available` };
    }
    if (product.stock < item.quantity) {
      return {
        error: `Only ${product.stock} left in stock for "${product.name}"`,
      };
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: String(product._id),
      sellerId: String(product.sellerId),
      name: product.name,
      image: product.images?.[0] || "",
      quantity: item.quantity,
      price: product.price,
      discount: 0,
    });
  }

  return { orderItems, subtotal };
}

function computeTotals(subtotal: number) {
  const TAX_RATE = 0.14;
  const SHIPPING_FEE = subtotal > 0 ? 5 : 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const totalAmount = Math.round((subtotal + tax + SHIPPING_FEE) * 100) / 100;
  return { tax, shipping: SHIPPING_FEE, totalAmount };
}

export async function placeOrder(rawData: unknown) {
  const validated = PlaceOrderSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: "Invalid order data",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { items, shippingAddress, paymentMethod, notes } = validated.data;

  await dbConnect();

  const session = await getOptionalSession();
  const userId = session?.id;

  const result = await validateCartItems(items);
  if ("error" in result) {
    return { success: false, error: result.error };
  }
  const { orderItems, subtotal } = result;
  const { tax, shipping, totalAmount } = computeTotals(subtotal);

  const guestEmail = validated.data.guestEmail;
  const guestName = validated.data.guestName;

  async function resolveCustomerEmail(): Promise<string | null> {
    if (guestEmail) return guestEmail;
    if (userId) {
      const user = await UserModel.findById(userId).select("email").lean();
      return (user as { email?: string } | null)?.email ?? null;
    }
    return null;
  }

  if (paymentMethod === "stripe") {
    const order = await OrderModel.create({
      userId: userId || undefined,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      status: "pending",
      paymentMethod: "stripe",
      paymentStatus: "pending",
      shippingAddress,
      guestEmail: guestEmail || undefined,
      statusHistory: [{ status: "pending", note: "Order created – awaiting Stripe payment" }],
      notes: notes || undefined,
    });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax (14%)" },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/confirmation/${order._id}?stripe=success`,
      cancel_url: `${origin}/checkout?stripe=cancelled`,
      metadata: { orderId: String(order._id) },
    });

    await OrderModel.findByIdAndUpdate(order._id, {
      stripeSessionId: checkoutSession.id,
    });

    return {
      success: true,
      orderId: String(order._id),
      total: totalAmount,
      stripeUrl: checkoutSession.url,
    };
  }

  const paymentStatus = "pending";

  const order = await OrderModel.create({
    userId: userId || undefined,
    items: orderItems,
    subtotal,
    tax,
    shipping,
    totalAmount,
    status: "pending",
    paymentMethod,
    paymentStatus,
    shippingAddress,
    guestEmail: guestEmail || undefined,
    statusHistory: [{ status: "pending", note: "Order placed (Cash on Delivery)" }],
    notes: notes || undefined,
  });

  for (const item of orderItems) {
    await ProductModel.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  if (userId) {
    await UserModel.findByIdAndUpdate(userId, { $set: { cartItems: [] } });
  }

  const email = await resolveCustomerEmail();
  if (email) {
    sendOrderConfirmationEmail({
      to: email,
      orderId: String(order._id),
      status: "pending",
      totalAmount,
      items: orderItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        city: shippingAddress.city,
        country: shippingAddress.country,
      },
    }).catch(() => {});
  }

  return {
    success: true,
    orderId: String(order._id),
    total: totalAmount,
  };
}

export async function getOrderConfirmation(orderId: string) {
  await dbConnect();
  try {
    const order = await OrderModel.findById(orderId).lean();
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch {
    return { success: false, error: "Failed to load order" };
  }
}
