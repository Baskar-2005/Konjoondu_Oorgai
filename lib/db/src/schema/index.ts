import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Existing Tables ──────────────────────────────────────────────────────────

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").default(""),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  courierName: text("courier_name"),
  trackingId: text("tracking_id"),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const trackingStepsTable = pgTable("tracking_steps", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  completed: boolean("completed").notNull().default(true),
});

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Customer Account Tables ──────────────────────────────────────────────────

export const customersTable = pgTable("customers", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  email: text("email").default(""),
  name: text("name").default(""),
  dob: text("dob").default(""),
  gender: text("gender").default(""),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  profilePicture: text("profile_picture").default(""),
  rewardPoints: integer("reward_points").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isFirstLogin: boolean("is_first_login").notNull().default(true),
  pendingOtp: text("pending_otp").default(""),
  otpExpiry: timestamp("otp_expiry"),
  communicationPrefs: jsonb("communication_prefs").$type<{
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  }>().default({ email: true, sms: true, whatsapp: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerSessionsTable = pgTable("customer_sessions", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  type: text("type").notNull().default("home"), // home | work | other
  recipientName: text("recipient_name").notNull(),
  phone: text("phone").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2").default(""),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  country: text("country").notNull().default("India"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: integer("price").notNull(),
  image: text("image").default(""),
  size: text("size").default(""),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id, { onDelete: "cascade" }),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").default(""),
  body: text("body").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  adminReply: text("admin_reply").default(""),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // order_update | shipping | refund | coupon | review_reply | issue_update
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
export type TrackingStep = typeof trackingStepsTable.$inferSelect;
export type NewTrackingStep = typeof trackingStepsTable.$inferInsert;
export type Issue = typeof issuesTable.$inferSelect;
export type NewIssue = typeof issuesTable.$inferInsert;

export type Customer = typeof customersTable.$inferSelect;
export type NewCustomer = typeof customersTable.$inferInsert;
export type Address = typeof addressesTable.$inferSelect;
export type WishlistItem = typeof wishlistTable.$inferSelect;
export type Review = typeof reviewsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
