export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "customer" | "seller" | "admin";
  isVerified: boolean;
  isSoftDeleted: boolean;
}

export interface Seller extends BaseDocument {
  userId: string;
  storeName: string;
  description: string;
  status: "pending" | "active" | "suspended";
  payoutAccountConnected: boolean;
}

export interface Product extends BaseDocument {
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
}

export interface Order extends BaseDocument {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Record<string, string>;
}

export interface Payment extends BaseDocument {
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  method: "card" | "paypal";
}
