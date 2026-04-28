import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* ignore */ }
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL || "";

async function seed() {
  await mongoose.connect(DATABASE_URL);
  console.log("Connected to MongoDB");

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("12345678aH", 12);

  // ─── Clean existing seed data ─────────────────────────
  const db = mongoose.connection.db!;
  const collections = [
    "users",
    "sellers",
    "products",
    "categories",
    "orders",
    "reviews",
  ];
  for (const name of collections) {
    const col = db.collection(name);
    const count = await col.countDocuments();
    if (count > 0) {
      await col.deleteMany({});
      console.log(`  Cleared ${name} (${count} docs)`);
    }
  }

  // ─── Users ────────────────────────────────────────────
  const usersCol = db.collection("users");

  const adminId = new mongoose.Types.ObjectId();
  const sellerId1 = new mongoose.Types.ObjectId();
  const sellerId2 = new mongoose.Types.ObjectId();
  const customerId1 = new mongoose.Types.ObjectId();
  const customerId2 = new mongoose.Types.ObjectId();
  const customerId3 = new mongoose.Types.ObjectId();

  const users = [
    {
      _id: adminId,
      name: "Admin User",
      email: "admin@shophub.com",
      phone: "+201000000001",
      passwordHash,
      role: "admin",
      isVerified: true,
      isSoftDeleted: false,
      addresses: [],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 0,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: sellerId1,
      name: "Mohamed Electronics",
      email: "seller1@shophub.com",
      phone: "+201000000002",
      passwordHash,
      role: "seller",
      isVerified: true,
      isSoftDeleted: false,
      addresses: [],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 0,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: sellerId2,
      name: "Sara Fashion",
      email: "seller2@shophub.com",
      phone: "+201000000003",
      passwordHash,
      role: "seller",
      isVerified: true,
      isSoftDeleted: false,
      addresses: [],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 0,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: customerId1,
      name: "Ahmed Yousry",
      email: "ahmed@test.com",
      phone: "+201112223344",
      passwordHash,
      role: "customer",
      isVerified: true,
      isSoftDeleted: false,
      addresses: [
        {
          _id: new mongoose.Types.ObjectId(),
          label: "Home",
          fullName: "Ahmed Yousry",
          addressLine1: "15 Tahrir Street",
          city: "Cairo",
          state: "Cairo",
          postalCode: "11511",
          country: "EG",
          phone: "+201112223344",
          isDefault: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          label: "Work",
          fullName: "Ahmed Yousry",
          addressLine1: "Smart Village, Building B12",
          addressLine2: "6th of October",
          city: "Giza",
          state: "Giza",
          postalCode: "12577",
          country: "EG",
          phone: "+201112223344",
          isDefault: false,
        },
      ],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 150,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: customerId2,
      name: "Fatma Ali",
      email: "fatma@test.com",
      phone: "+201555666777",
      passwordHash,
      role: "customer",
      isVerified: true,
      isSoftDeleted: false,
      addresses: [
        {
          _id: new mongoose.Types.ObjectId(),
          label: "Home",
          fullName: "Fatma Ali",
          addressLine1: "22 Corniche El Nil",
          city: "Alexandria",
          state: "Alexandria",
          postalCode: "21599",
          country: "EG",
          phone: "+201555666777",
          isDefault: true,
        },
      ],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 80,
      preferredLanguage: "ar",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: customerId3,
      name: "Omar Hassan",
      email: "omar@test.com",
      phone: "+201999888777",
      passwordHash,
      role: "customer",
      isVerified: false,
      isSoftDeleted: false,
      addresses: [],
      wishlist: [],
      savedCards: [],
      loyaltyPoints: 0,
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await usersCol.insertMany(users);
  console.log(`✓ Created ${users.length} users`);

  // ─── Sellers ──────────────────────────────────────────
  const sellersCol = db.collection("sellers");

  const sellerDoc1Id = new mongoose.Types.ObjectId();
  const sellerDoc2Id = new mongoose.Types.ObjectId();

  const sellers = [
    {
      _id: sellerDoc1Id,
      userId: sellerId1,
      storeName: "MoTech Store",
      description: "Best electronics and gadgets in Egypt",
      status: "active",
      payoutAccountConnected: true,
      earnings: 15600,
      totalSales: 234,
      rating: 4.5,
      reviewCount: 89,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: sellerDoc2Id,
      userId: sellerId2,
      storeName: "Sara's Boutique",
      description: "Trendy fashion and accessories",
      status: "active",
      payoutAccountConnected: false,
      earnings: 8200,
      totalSales: 156,
      rating: 4.8,
      reviewCount: 62,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await sellersCol.insertMany(sellers);
  console.log(`✓ Created ${sellers.length} sellers`);

  // ─── Products ─────────────────────────────────────────
  const productsCol = db.collection("products");

  const productIds: mongoose.Types.ObjectId[] = [];
  const products = [
    {
      sellerId: sellerDoc1Id,
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-cancelling wireless headphones with 30hr battery life. Deep bass, clear highs, and comfortable over-ear design.",
      price: 89.99,
      compareAtPrice: 129.99,
      stock: 45,
      category: "Electronics",
      tags: ["headphones", "bluetooth", "wireless", "audio"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/headphones.jpg"],
      isActive: true,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 24,
    },
    {
      sellerId: sellerDoc1Id,
      name: "Smart Watch Pro X",
      description: "Feature-packed smartwatch with heart rate monitor, GPS tracking, and 7-day battery. Water resistant to 50m.",
      price: 199.99,
      compareAtPrice: 249.99,
      stock: 30,
      category: "Electronics",
      tags: ["smartwatch", "fitness", "wearable"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/watch.jpg"],
      isActive: true,
      isFeatured: true,
      rating: 4.3,
      reviewCount: 18,
    },
    {
      sellerId: sellerDoc1Id,
      name: "USB-C Fast Charging Cable (2m)",
      description: "Durable braided USB-C cable with 100W fast charging support. Compatible with all USB-C devices.",
      price: 12.99,
      stock: 200,
      category: "Accessories",
      tags: ["cable", "usb-c", "charger"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/cable.jpg"],
      isActive: true,
      isFeatured: false,
      rating: 4.1,
      reviewCount: 56,
    },
    {
      sellerId: sellerDoc1Id,
      name: "Portable Bluetooth Speaker",
      description: "Compact waterproof speaker with 360° sound, 12hr battery, and built-in microphone for calls.",
      price: 49.99,
      compareAtPrice: 69.99,
      stock: 60,
      category: "Electronics",
      tags: ["speaker", "bluetooth", "portable", "waterproof"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/speaker.jpg"],
      isActive: true,
      isFeatured: false,
      rating: 4.4,
      reviewCount: 31,
    },
    {
      sellerId: sellerDoc1Id,
      name: "Mechanical Gaming Keyboard",
      description: "RGB mechanical keyboard with Cherry MX switches, programmable keys, and aluminum frame.",
      price: 74.99,
      stock: 25,
      category: "Electronics",
      tags: ["keyboard", "gaming", "mechanical", "rgb"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/keyboard.jpg"],
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 42,
    },
    {
      sellerId: sellerDoc2Id,
      name: "Floral Summer Dress",
      description: "Lightweight floral print dress perfect for summer. Breathable cotton fabric with adjustable waist tie.",
      price: 39.99,
      compareAtPrice: 59.99,
      stock: 80,
      category: "Fashion",
      tags: ["dress", "summer", "floral", "women"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/dress.jpg"],
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 15,
    },
    {
      sellerId: sellerDoc2Id,
      name: "Classic Leather Wallet",
      description: "Genuine leather bifold wallet with RFID protection. Holds 8 cards, 2 bill compartments.",
      price: 29.99,
      stock: 100,
      category: "Accessories",
      tags: ["wallet", "leather", "men", "rfid"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/wallet.jpg"],
      isActive: true,
      isFeatured: false,
      rating: 4.5,
      reviewCount: 28,
    },
    {
      sellerId: sellerDoc2Id,
      name: "Sunglasses UV400 Polarized",
      description: "Stylish polarized sunglasses with UV400 protection. Lightweight titanium frame.",
      price: 24.99,
      compareAtPrice: 44.99,
      stock: 70,
      category: "Accessories",
      tags: ["sunglasses", "polarized", "uv", "summer"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/sunglasses.jpg"],
      isActive: true,
      isFeatured: false,
      rating: 4.2,
      reviewCount: 19,
    },
    {
      sellerId: sellerDoc2Id,
      name: "Canvas Backpack",
      description: "Durable canvas backpack with laptop compartment (fits 15.6\"), water bottle pocket, and padded straps.",
      price: 44.99,
      stock: 50,
      category: "Bags",
      tags: ["backpack", "canvas", "laptop", "travel"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/backpack.jpg"],
      isActive: true,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 22,
    },
    {
      sellerId: sellerDoc2Id,
      name: "Running Shoes - Air Mesh",
      description: "Ultra-lightweight running shoes with breathable air mesh upper and cushioned sole. Available in 5 colors.",
      price: 64.99,
      compareAtPrice: 89.99,
      stock: 0,
      category: "Shoes",
      tags: ["shoes", "running", "sports", "lightweight"],
      images: ["https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg"],
      isActive: true,
      isFeatured: false,
      rating: 4.0,
      reviewCount: 11,
    },
  ];

  for (const p of products) {
    const id = new mongoose.Types.ObjectId();
    productIds.push(id);
    await productsCol.insertOne({
      _id: id,
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`✓ Created ${products.length} products`);

  const categoriesCol = db.collection("categories");
  const uniqueCategories = [...new Set(products.map((p) => p.category))];
  const catNow = new Date();
  for (const name of uniqueCategories) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    await categoriesCol.insertOne({
      _id: new mongoose.Types.ObjectId(),
      name,
      slug,
      isActive: true,
      createdAt: catNow,
      updatedAt: catNow,
    });
  }
  console.log(`✓ Created ${uniqueCategories.length} categories`);

  // Add some products to customer wishlists
  await usersCol.updateOne(
    { _id: customerId1 },
    { $set: { wishlist: [productIds[0], productIds[1], productIds[5], productIds[8]] } },
  );
  await usersCol.updateOne(
    { _id: customerId2 },
    { $set: { wishlist: [productIds[2], productIds[6], productIds[7]] } },
  );
  console.log("✓ Updated wishlists");

  // ─── Orders ───────────────────────────────────────────
  const ordersCol = db.collection("orders");
  const orderIds: mongoose.Types.ObjectId[] = [];

  const statuses = ["delivered", "shipped", "processing", "paid", "pending", "cancelled"] as const;
  const paymentStatuses = ["paid", "paid", "paid", "paid", "pending", "refunded"] as const;

  const orderData = [
    {
      userId: customerId1,
      items: [
        { productId: productIds[0], sellerId: sellerDoc1Id, name: "Wireless Bluetooth Headphones", image: "", quantity: 1, price: 89.99, discount: 0 },
        { productId: productIds[2], sellerId: sellerDoc1Id, name: "USB-C Fast Charging Cable (2m)", image: "", quantity: 2, price: 12.99, discount: 0 },
      ],
      subtotal: 115.97,
      tax: 16.24,
      shipping: 5.00,
      totalAmount: 137.21,
      status: statuses[0],
      paymentStatus: paymentStatuses[0],
      trackingNumber: "EG123456789",
      carrier: "EMS",
      shippingAddress: { fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344" },
    },
    {
      userId: customerId1,
      items: [
        { productId: productIds[1], sellerId: sellerDoc1Id, name: "Smart Watch Pro X", image: "", quantity: 1, price: 199.99, discount: 20 },
      ],
      subtotal: 199.99,
      tax: 25.20,
      shipping: 0,
      totalAmount: 205.19,
      status: statuses[1],
      paymentStatus: paymentStatuses[1],
      trackingNumber: "EG987654321",
      carrier: "Aramex",
      shippingAddress: { fullName: "Ahmed Yousry", addressLine1: "Smart Village, Building B12", addressLine2: "6th of October", city: "Giza", state: "Giza", postalCode: "12577", country: "EG", phone: "+201112223344" },
    },
    {
      userId: customerId1,
      items: [
        { productId: productIds[5], sellerId: sellerDoc2Id, name: "Floral Summer Dress", image: "", quantity: 1, price: 39.99, discount: 0 },
        { productId: productIds[6], sellerId: sellerDoc2Id, name: "Classic Leather Wallet", image: "", quantity: 1, price: 29.99, discount: 0 },
        { productId: productIds[8], sellerId: sellerDoc2Id, name: "Canvas Backpack", image: "", quantity: 1, price: 44.99, discount: 5 },
      ],
      subtotal: 114.97,
      tax: 15.40,
      shipping: 10.00,
      totalAmount: 135.37,
      status: statuses[2],
      paymentStatus: paymentStatuses[2],
      shippingAddress: { fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344" },
    },
    {
      userId: customerId1,
      items: [
        { productId: productIds[4], sellerId: sellerDoc1Id, name: "Mechanical Gaming Keyboard", image: "", quantity: 1, price: 74.99, discount: 0 },
      ],
      subtotal: 74.99,
      tax: 10.50,
      shipping: 5.00,
      totalAmount: 90.49,
      status: statuses[4],
      paymentStatus: paymentStatuses[4],
      shippingAddress: { fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344" },
    },
    {
      userId: customerId1,
      items: [
        { productId: productIds[9], sellerId: sellerDoc2Id, name: "Running Shoes - Air Mesh", image: "", quantity: 1, price: 64.99, discount: 10 },
      ],
      subtotal: 64.99,
      tax: 7.70,
      shipping: 5.00,
      totalAmount: 67.69,
      status: statuses[5],
      paymentStatus: paymentStatuses[5],
      shippingAddress: { fullName: "Ahmed Yousry", addressLine1: "15 Tahrir Street", city: "Cairo", state: "Cairo", postalCode: "11511", country: "EG", phone: "+201112223344" },
    },
    {
      userId: customerId2,
      items: [
        { productId: productIds[3], sellerId: sellerDoc1Id, name: "Portable Bluetooth Speaker", image: "", quantity: 2, price: 49.99, discount: 0 },
      ],
      subtotal: 99.98,
      tax: 14.00,
      shipping: 5.00,
      totalAmount: 118.98,
      status: statuses[0],
      paymentStatus: paymentStatuses[0],
      trackingNumber: "EG555111222",
      carrier: "DHL",
      shippingAddress: { fullName: "Fatma Ali", addressLine1: "22 Corniche El Nil", city: "Alexandria", state: "Alexandria", postalCode: "21599", country: "EG", phone: "+201555666777" },
    },
    {
      userId: customerId2,
      items: [
        { productId: productIds[7], sellerId: sellerDoc2Id, name: "Sunglasses UV400 Polarized", image: "", quantity: 1, price: 24.99, discount: 0 },
      ],
      subtotal: 24.99,
      tax: 3.50,
      shipping: 5.00,
      totalAmount: 33.49,
      status: statuses[3],
      paymentStatus: paymentStatuses[3],
      shippingAddress: { fullName: "Fatma Ali", addressLine1: "22 Corniche El Nil", city: "Alexandria", state: "Alexandria", postalCode: "21599", country: "EG", phone: "+201555666777" },
    },
  ];

  for (let i = 0; i < orderData.length; i++) {
    const id = new mongoose.Types.ObjectId();
    orderIds.push(id);
    const daysAgo = (orderData.length - i) * 5;
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    await ordersCol.insertOne({
      _id: id,
      ...orderData[i],
      createdAt,
      updatedAt: createdAt,
    });
  }
  console.log(`✓ Created ${orderData.length} orders`);

  // ─── Reviews ──────────────────────────────────────────
  const reviewsCol = db.collection("reviews");

  const reviews = [
    {
      userId: customerId1,
      productId: productIds[0],
      orderId: orderIds[0],
      rating: 5,
      title: "Amazing sound quality!",
      comment: "Best headphones I've ever owned. The noise cancellation is incredible and the battery lasts forever. Highly recommended!",
      isVerifiedPurchase: true,
    },
    {
      userId: customerId1,
      productId: productIds[2],
      orderId: orderIds[0],
      rating: 4,
      title: "Good cable, fast charging",
      comment: "Works perfectly with my laptop and phone. The braided design feels durable. Only wish it came in a 3m option.",
      isVerifiedPurchase: true,
    },
    {
      userId: customerId1,
      productId: productIds[5],
      rating: 5,
      title: "Beautiful dress!",
      comment: "The fabric is so soft and the print is lovely. Fits perfectly. Will buy more from this seller.",
      isVerifiedPurchase: false,
    },
    {
      userId: customerId2,
      productId: productIds[3],
      orderId: orderIds[5],
      rating: 4,
      title: "Great speaker for the price",
      comment: "Sound is surprisingly good for a portable speaker. Battery lasts all day. Waterproofing came in handy at the beach!",
      isVerifiedPurchase: true,
    },
    {
      userId: customerId2,
      productId: productIds[0],
      rating: 4,
      title: "Very comfortable",
      comment: "I wear these for hours and they never hurt my ears. Sound quality is great. The Bluetooth range could be a bit better.",
      isVerifiedPurchase: false,
    },
    {
      userId: customerId2,
      productId: productIds[7],
      orderId: orderIds[6],
      rating: 3,
      title: "Decent sunglasses",
      comment: "They look nice but feel a bit flimsy. The polarization works well though. OK for the price.",
      isVerifiedPurchase: true,
    },
  ];

  for (const r of reviews) {
    await reviewsCol.insertOne({
      _id: new mongoose.Types.ObjectId(),
      ...r,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`✓ Created ${reviews.length} reviews`);

  // ─── Summary ──────────────────────────────────────────
  console.log("\n========== SEED COMPLETE ==========");
  console.log("Login credentials (all use password: 12345678aH):");
  console.log("  Admin:     admin@shophub.com");
  console.log("  Seller 1:  seller1@shophub.com");
  console.log("  Seller 2:  seller2@shophub.com");
  console.log("  Customer:  ahmed@test.com  (has addresses, wishlist, orders, reviews)");
  console.log("  Customer:  fatma@test.com  (has address, wishlist, orders, reviews)");
  console.log("  Customer:  omar@test.com   (empty account)");
  console.log("===================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
