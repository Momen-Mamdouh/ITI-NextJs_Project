export interface BaseModel {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface User extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "seller" | "admin";
  isVerified: boolean;
  isSoftDeleted: boolean;
  addresses: Address[];
  wishlist: string[];
  savedCards: SavedCard[];
  loyaltyPoints: number;
  preferredLanguage: string;
}

export interface Review extends BaseModel {
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
}

export interface SavedCard {
  stripeCardId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Seller extends BaseModel {
  userId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: "pending" | "active" | "suspended";
  payoutAccountConnected: boolean;
  stripeAccountId?: string;
  earnings: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
}

export interface Product extends BaseModel {
  sellerId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  discount?: ProductDiscount;
}

export interface ProductDiscount {
  type: "percent" | "fixed";
  value: number;
  startDate?: string;
  endDate?: string;
}

export interface Order extends BaseModel {
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shippingAddress: ShippingAddress;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
  carrier?: string;
  promoCode?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  sellerId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Payment extends BaseModel {
  orderId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  method: "card" | "paypal" | "razorpay";
  cardLast4?: string;
  cardBrand?: string;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PromoCode extends BaseModel {
  code: string;
  description?: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableRoles: ("customer" | "seller" | "admin")[];
  applicableCategories: string[];
  applicableSellers: string[];
}

export interface Banner extends BaseModel {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: "hero" | "category" | "sidebar" | "footer";
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience: "all" | "customer" | "seller" | "admin";
  language: string;
}
