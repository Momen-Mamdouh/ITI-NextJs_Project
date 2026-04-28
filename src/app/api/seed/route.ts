import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  await dbConnect();
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("12345678aH", 12);

  const db = mongoose.connection.db!;

  // Clean
  for (const name of [
    "users",
    "sellers",
    "products",
    "categories",
    "orders",
    "reviews",
  ]) {
    await db.collection(name).deleteMany({});
  }

  // ─── Users ────────────────────────────────────────────
  const adminId = new mongoose.Types.ObjectId();
  const sellerId1 = new mongoose.Types.ObjectId();
  const sellerId2 = new mongoose.Types.ObjectId();
  const customerId1 = new mongoose.Types.ObjectId();
  const customerId2 = new mongoose.Types.ObjectId();
  const customerId3 = new mongoose.Types.ObjectId();

  const now = new Date();
  const userBase = { passwordHash, isVerified: true, isSoftDeleted: false, savedCards: [], loyaltyPoints: 0, preferredLanguage: "en", createdAt: now, updatedAt: now };

  await db.collection("users").insertMany([
    { _id: adminId, name: "Admin User", email: "admin@shophub.com", phone: "+201000000001", role: "admin", addresses: [], wishlist: [], ...userBase },
    { _id: sellerId1, name: "Mohamed Electronics", email: "seller1@shophub.com", phone: "+201000000002", role: "seller", addresses: [], wishlist: [], ...userBase },
    { _id: sellerId2, name: "Sara Fashion", email: "seller2@shophub.com", phone: "+201000000003", role: "seller", addresses: [], wishlist: [], ...userBase },
    {
      _id: customerId1, name: "Ahmed Yousry", email: "ahmed@test.com", phone: "+201112223344", role: "customer",
      addresses: [
        { _id: new mongoose.Types.ObjectId(), label: "Home", fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344", isDefault: true },
        { _id: new mongoose.Types.ObjectId(), label: "Work", fullName: "Ahmed Yousry", addressLine1: "Smart Village, Building B12", addressLine2: "6th of October", city: "Giza", state: "Giza", postalCode: "12577", country: "EG", phone: "+201112223344", isDefault: false },
      ],
      wishlist: [], ...userBase, loyaltyPoints: 150,
    },
    {
      _id: customerId2, name: "Fatma Ali", email: "fatma@test.com", phone: "+201555666777", role: "customer",
      addresses: [
        { _id: new mongoose.Types.ObjectId(), label: "Home", fullName: "Fatma Ali", addressLine1: "22 Corniche El Nil", city: "Alexandria", state: "Alexandria", postalCode: "21599", country: "EG", phone: "+201555666777", isDefault: true },
      ],
      wishlist: [], ...userBase, loyaltyPoints: 80, preferredLanguage: "ar",
    },
    { _id: customerId3, name: "Omar Hassan", email: "omar@test.com", phone: "+201999888777", role: "customer", addresses: [], wishlist: [], ...userBase, isVerified: false },
  ]);

  // ─── Sellers ──────────────────────────────────────────
  const sellerDoc1Id = new mongoose.Types.ObjectId();
  const sellerDoc2Id = new mongoose.Types.ObjectId();

  await db.collection("sellers").insertMany([
    { _id: sellerDoc1Id, userId: sellerId1, storeName: "MoTech Store", description: "Best electronics and gadgets in Egypt", status: "active", payoutAccountConnected: true, earnings: 15600, totalSales: 234, rating: 4.5, reviewCount: 89, createdAt: now, updatedAt: now },
    { _id: sellerDoc2Id, userId: sellerId2, storeName: "Sara's Boutique", description: "Trendy fashion and accessories", status: "active", payoutAccountConnected: false, earnings: 8200, totalSales: 156, rating: 4.8, reviewCount: 62, createdAt: now, updatedAt: now },
  ]);

  // ─── Products ─────────────────────────────────────────
  const productsList = [
    { sellerId: sellerDoc1Id, name: "Wireless Bluetooth Headphones", description: "Premium noise-cancelling wireless headphones with 30hr battery life.", price: 89.99, compareAtPrice: 129.99, stock: 45, category: "Electronics", tags: ["headphones", "bluetooth"], images: ["https://picsum.photos/seed/headphones/800/800"], isActive: true, isFeatured: true, rating: 4.6, reviewCount: 24 },
    { sellerId: sellerDoc1Id, name: "Smart Watch Pro X", description: "Feature-packed smartwatch with heart rate monitor, GPS tracking, and 7-day battery.", price: 199.99, compareAtPrice: 249.99, stock: 30, category: "Electronics", tags: ["smartwatch", "fitness"], images: ["https://picsum.photos/seed/smartwatch/800/800"], isActive: true, isFeatured: true, rating: 4.3, reviewCount: 18 },
    { sellerId: sellerDoc1Id, name: "USB-C Fast Charging Cable (2m)", description: "Durable braided USB-C cable with 100W fast charging support.", price: 12.99, stock: 200, category: "Accessories", tags: ["cable", "usb-c"], images: ["https://picsum.photos/seed/usbcable/800/800"], isActive: true, isFeatured: false, rating: 4.1, reviewCount: 56 },
    { sellerId: sellerDoc1Id, name: "Portable Bluetooth Speaker", description: "Compact waterproof speaker with 360° sound and 12hr battery.", price: 49.99, compareAtPrice: 69.99, stock: 60, category: "Electronics", tags: ["speaker", "bluetooth"], images: ["https://picsum.photos/seed/speaker/800/800"], isActive: true, isFeatured: false, rating: 4.4, reviewCount: 31 },
    { sellerId: sellerDoc1Id, name: "Mechanical Gaming Keyboard", description: "RGB mechanical keyboard with Cherry MX switches and aluminum frame.", price: 74.99, stock: 25, category: "Electronics", tags: ["keyboard", "gaming"], images: ["https://picsum.photos/seed/keyboard/800/800"], isActive: true, isFeatured: true, rating: 4.7, reviewCount: 42 },
    { sellerId: sellerDoc2Id, name: "Floral Summer Dress", description: "Lightweight floral print dress. Breathable cotton with adjustable waist tie.", price: 39.99, compareAtPrice: 59.99, stock: 80, category: "Fashion", tags: ["dress", "summer"], images: ["https://picsum.photos/seed/dress/800/800"], isActive: true, isFeatured: true, rating: 4.8, reviewCount: 15 },
    { sellerId: sellerDoc2Id, name: "Classic Leather Wallet", description: "Genuine leather bifold wallet with RFID protection. Holds 8 cards.", price: 29.99, stock: 100, category: "Accessories", tags: ["wallet", "leather"], images: ["https://picsum.photos/seed/wallet/800/800"], isActive: true, isFeatured: false, rating: 4.5, reviewCount: 28 },
    { sellerId: sellerDoc2Id, name: "Sunglasses UV400 Polarized", description: "Stylish polarized sunglasses with UV400 protection.", price: 24.99, compareAtPrice: 44.99, stock: 70, category: "Accessories", tags: ["sunglasses", "polarized"], images: ["https://picsum.photos/seed/sunglasses/800/800"], isActive: true, isFeatured: false, rating: 4.2, reviewCount: 19 },
    { sellerId: sellerDoc2Id, name: "Canvas Backpack", description: "Durable canvas backpack with laptop compartment and padded straps.", price: 44.99, stock: 50, category: "Bags", tags: ["backpack", "canvas"], images: ["https://picsum.photos/seed/backpack/800/800"], isActive: true, isFeatured: true, rating: 4.6, reviewCount: 22 },
    { sellerId: sellerDoc2Id, name: "Running Shoes - Air Mesh", description: "Ultra-lightweight running shoes with breathable air mesh upper.", price: 64.99, compareAtPrice: 89.99, stock: 0, category: "Shoes", tags: ["shoes", "running"], images: ["https://picsum.photos/seed/runshoes/800/800"], isActive: true, isFeatured: false, rating: 4.0, reviewCount: 11 },
  ];

  const productIds: mongoose.Types.ObjectId[] = [];
  for (const p of productsList) {
    const id = new mongoose.Types.ObjectId();
    productIds.push(id);
    await db.collection("products").insertOne({ _id: id, ...p, createdAt: now, updatedAt: now });
  }

  const uniqueCategories = [...new Set(productsList.map((p) => p.category))];
  for (const name of uniqueCategories) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    await db.collection("categories").insertOne({
      _id: new mongoose.Types.ObjectId(),
      name,
      slug,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Update wishlists
  await db.collection("users").updateOne({ _id: customerId1 }, { $set: { wishlist: [productIds[0], productIds[1], productIds[5], productIds[8]] } });
  await db.collection("users").updateOne({ _id: customerId2 }, { $set: { wishlist: [productIds[2], productIds[6], productIds[7]] } });

  // ─── Orders ───────────────────────────────────────────
  const orderIds: mongoose.Types.ObjectId[] = [];
  const addr1 = { fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344" };
  const addr1w = { fullName: "Ahmed Yousry", addressLine1: "Smart Village, Building B12", addressLine2: "6th of October", city: "Giza", state: "Giza", postalCode: "12577", country: "EG", phone: "+201112223344" };
  const addr2 = { fullName: "Fatma Ali", addressLine1: "22 Corniche El Nil", city: "Alexandria", state: "Alexandria", postalCode: "21599", country: "EG", phone: "+201555666777" };

  const orders = [
    { userId: customerId1, items: [{ productId: productIds[0], sellerId: sellerDoc1Id, name: "Wireless Bluetooth Headphones", image: "", quantity: 1, price: 89.99, discount: 0 }, { productId: productIds[2], sellerId: sellerDoc1Id, name: "USB-C Fast Charging Cable (2m)", image: "", quantity: 2, price: 12.99, discount: 0 }], subtotal: 115.97, tax: 16.24, shipping: 5.00, totalAmount: 137.21, status: "delivered", paymentStatus: "paid", trackingNumber: "EG123456789", carrier: "EMS", shippingAddress: addr1 },
    { userId: customerId1, items: [{ productId: productIds[1], sellerId: sellerDoc1Id, name: "Smart Watch Pro X", image: "", quantity: 1, price: 199.99, discount: 20 }], subtotal: 199.99, tax: 25.20, shipping: 0, totalAmount: 205.19, status: "shipped", paymentStatus: "paid", trackingNumber: "EG987654321", carrier: "Aramex", shippingAddress: addr1w },
    { userId: customerId1, items: [{ productId: productIds[5], sellerId: sellerDoc2Id, name: "Floral Summer Dress", image: "", quantity: 1, price: 39.99, discount: 0 }, { productId: productIds[6], sellerId: sellerDoc2Id, name: "Classic Leather Wallet", image: "", quantity: 1, price: 29.99, discount: 0 }, { productId: productIds[8], sellerId: sellerDoc2Id, name: "Canvas Backpack", image: "", quantity: 1, price: 44.99, discount: 5 }], subtotal: 114.97, tax: 15.40, shipping: 10.00, totalAmount: 135.37, status: "processing", paymentStatus: "paid", shippingAddress: addr1 },
    { userId: customerId1, items: [{ productId: productIds[4], sellerId: sellerDoc1Id, name: "Mechanical Gaming Keyboard", image: "", quantity: 1, price: 74.99, discount: 0 }], subtotal: 74.99, tax: 10.50, shipping: 5.00, totalAmount: 90.49, status: "pending", paymentStatus: "pending", shippingAddress: addr1 },
    { userId: customerId1, items: [{ productId: productIds[9], sellerId: sellerDoc2Id, name: "Running Shoes - Air Mesh", image: "", quantity: 1, price: 64.99, discount: 10 }], subtotal: 64.99, tax: 7.70, shipping: 5.00, totalAmount: 67.69, status: "cancelled", paymentStatus: "refunded", shippingAddress: addr1 },
    { userId: customerId2, items: [{ productId: productIds[3], sellerId: sellerDoc1Id, name: "Portable Bluetooth Speaker", image: "", quantity: 2, price: 49.99, discount: 0 }], subtotal: 99.98, tax: 14.00, shipping: 5.00, totalAmount: 118.98, status: "delivered", paymentStatus: "paid", trackingNumber: "EG555111222", carrier: "DHL", shippingAddress: addr2 },
    { userId: customerId2, items: [{ productId: productIds[7], sellerId: sellerDoc2Id, name: "Sunglasses UV400 Polarized", image: "", quantity: 1, price: 24.99, discount: 0 }], subtotal: 24.99, tax: 3.50, shipping: 5.00, totalAmount: 33.49, status: "paid", paymentStatus: "paid", shippingAddress: addr2 },
  ];

  for (let i = 0; i < orders.length; i++) {
    const id = new mongoose.Types.ObjectId();
    orderIds.push(id);
    const daysAgo = (orders.length - i) * 5;
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    await db.collection("orders").insertOne({ _id: id, ...orders[i], createdAt, updatedAt: createdAt });
  }

  // ─── Reviews ──────────────────────────────────────────
  const reviews = [
    { userId: customerId1, productId: productIds[0], orderId: orderIds[0], rating: 5, title: "Amazing sound quality!", comment: "Best headphones I've ever owned. The noise cancellation is incredible.", isVerifiedPurchase: true },
    { userId: customerId1, productId: productIds[2], orderId: orderIds[0], rating: 4, title: "Good cable, fast charging", comment: "Works perfectly with my laptop. The braided design feels durable.", isVerifiedPurchase: true },
    { userId: customerId1, productId: productIds[5], rating: 5, title: "Beautiful dress!", comment: "The fabric is so soft and the print is lovely. Fits perfectly.", isVerifiedPurchase: false },
    { userId: customerId2, productId: productIds[3], orderId: orderIds[5], rating: 4, title: "Great speaker for the price", comment: "Sound is surprisingly good for a portable speaker. Battery lasts all day.", isVerifiedPurchase: true },
    { userId: customerId2, productId: productIds[0], rating: 4, title: "Very comfortable", comment: "I wear these for hours and they never hurt my ears. Sound quality is great.", isVerifiedPurchase: false },
    { userId: customerId2, productId: productIds[7], orderId: orderIds[6], rating: 3, title: "Decent sunglasses", comment: "They look nice but feel a bit flimsy. The polarization works well though.", isVerifiedPurchase: true },
  ];

  for (const r of reviews) {
    await db.collection("reviews").insertOne({ _id: new mongoose.Types.ObjectId(), ...r, createdAt: now, updatedAt: now });
  }

  const summary = {
    success: true,
    seeded: { users: 6, sellers: 2, products: 10, orders: 7, reviews: 6 },
    credentials: {
      password: "12345678aH",
      accounts: [
        { role: "admin", email: "admin@shophub.com" },
        { role: "seller", email: "seller1@shophub.com" },
        { role: "seller", email: "seller2@shophub.com" },
        { role: "customer", email: "ahmed@test.com", note: "has addresses, wishlist, 5 orders, 3 reviews" },
        { role: "customer", email: "fatma@test.com", note: "has address, wishlist, 2 orders, 3 reviews" },
        { role: "customer", email: "omar@test.com", note: "empty account" },
      ],
    },
  };

  return NextResponse.json(summary, { status: 200 });
}
