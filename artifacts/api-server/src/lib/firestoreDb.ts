/**
 * Firestore data layer — replaces the Drizzle/PostgreSQL layer.
 *
 * Collections:
 *   /customers/{customerId}
 *     /addresses/{addressId}
 *     /wishlist/{itemId}
 *     /reviews/{reviewId}
 *     /notifications/{notificationId}
 *   /sessions/{sessionId}        (top-level for fast token lookups)
 *   /orders/{orderId}
 *     /items/{itemId}
 *     /tracking/{stepId}
 *   /issues/{issueId}            (top-level so PATCH /issues/:id doesn't need orderId)
 */

import { fdb } from "./firebase";
import type { Timestamp } from "firebase-admin/firestore";

// ── Timestamp helpers ─────────────────────────────────────────────────────────

function fromTs(v: unknown): Date {
  if (v && typeof (v as Timestamp).toDate === "function") {
    return (v as Timestamp).toDate();
  }
  return v instanceof Date ? v : new Date(v as string);
}

function fromTsOrNull(v: unknown): Date | null {
  if (!v) return null;
  return fromTs(v);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  phone: string;
  email: string;
  name: string;
  dob: string;
  gender: string;
  passwordHash: string;
  salt: string;
  profilePicture: string;
  rewardPoints: number;
  isVerified: boolean;
  isFirstLogin: boolean;
  pendingOtp: string;
  otpExpiry: Date | null;
  communicationPrefs: { email: boolean; sms: boolean; whatsapp: boolean };
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerSession = {
  id: string;
  customerId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

export type Order = {
  id: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  customerName: string;
  customerEmail: string;
  customerEmailLower: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  courierName: string | null;
  trackingId: string | null;
  estimatedDelivery: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

export type TrackingStep = {
  id: string;
  orderId: string;
  status: string;
  label: string;
  description: string;
  timestamp: Date;
  completed: boolean;
};

export type Issue = {
  id: string;
  orderId: string;
  type: string;
  description: string;
  status: string;
  adminReply: string | null;
  createdAt: Date;
};

export type Address = {
  id: string;
  customerId: string;
  label: string;
  type: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WishlistItem = {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  size: string;
  addedAt: Date;
};

export type Review = {
  id: string;
  customerId: string;
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  status: string;
  adminReply: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
  id: string;
  customerId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, string>;
  createdAt: Date;
};

// ── Customers ─────────────────────────────────────────────────────────────────

function toCustomer(id: string, d: Record<string, unknown>): Customer {
  return {
    id,
    phone: (d.phone as string) ?? "",
    email: (d.email as string) ?? "",
    name: (d.name as string) ?? "",
    dob: (d.dob as string) ?? "",
    gender: (d.gender as string) ?? "",
    passwordHash: (d.passwordHash as string) ?? "",
    salt: (d.salt as string) ?? "",
    profilePicture: (d.profilePicture as string) ?? "",
    rewardPoints: (d.rewardPoints as number) ?? 0,
    isVerified: (d.isVerified as boolean) ?? false,
    isFirstLogin: (d.isFirstLogin as boolean) ?? true,
    pendingOtp: (d.pendingOtp as string) ?? "",
    otpExpiry: fromTsOrNull(d.otpExpiry),
    communicationPrefs: (d.communicationPrefs as Customer["communicationPrefs"]) ?? {
      email: true,
      sms: true,
      whatsapp: true,
    },
    createdAt: fromTs(d.createdAt),
    updatedAt: fromTs(d.updatedAt),
  };
}

export const customersCol = {
  async findAll(): Promise<Customer[]> {
    const snap = await fdb.collection("customers").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => toCustomer(d.id, d.data() as Record<string, unknown>));
  },

  async findById(id: string): Promise<Customer | null> {
    const snap = await fdb.collection("customers").doc(id).get();
    if (!snap.exists) return null;
    return toCustomer(snap.id, snap.data() as Record<string, unknown>);
  },

  async findByPhone(phone: string): Promise<Customer | null> {
    const snap = await fdb
      .collection("customers")
      .where("phone", "==", phone)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return toCustomer(doc.id, doc.data() as Record<string, unknown>);
  },

  async create(
    id: string,
    data: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): Promise<Customer> {
    const now = new Date();
    const docData = { ...data, createdAt: now, updatedAt: now };
    await fdb.collection("customers").doc(id).set(docData);
    return toCustomer(id, docData as unknown as Record<string, unknown>);
  },

  async update(id: string, updates: Partial<Omit<Customer, "id">>): Promise<Customer> {
    const now = new Date();
    await fdb
      .collection("customers")
      .doc(id)
      .update({ ...updates, updatedAt: now });
    const fresh = await this.findById(id);
    return fresh!;
  },

  async updateByPhone(phone: string, updates: Partial<Omit<Customer, "id">>): Promise<void> {
    const snap = await fdb
      .collection("customers")
      .where("phone", "==", phone)
      .limit(1)
      .get();
    if (snap.empty) return;
    await snap.docs[0].ref.update({ ...updates, updatedAt: new Date() });
  },

  async findByEmail(email: string): Promise<Customer | null> {
    const snap = await fdb
      .collection("customers")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return toCustomer(doc.id, doc.data() as Record<string, unknown>);
  },
};

// ── Sessions ──────────────────────────────────────────────────────────────────

function toSession(id: string, d: Record<string, unknown>): CustomerSession {
  return {
    id,
    customerId: d.customerId as string,
    token: d.token as string,
    expiresAt: fromTs(d.expiresAt),
    createdAt: fromTs(d.createdAt),
  };
}

export const sessionsCol = {
  async create(customerId: string, token: string, expiresAt: Date): Promise<void> {
    await fdb
      .collection("sessions")
      .add({ customerId, token, expiresAt, createdAt: new Date() });
  },

  async findByToken(token: string): Promise<CustomerSession | null> {
    const snap = await fdb
      .collection("sessions")
      .where("token", "==", token)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return toSession(doc.id, doc.data() as Record<string, unknown>);
  },

  async deleteByToken(token: string): Promise<void> {
    const snap = await fdb
      .collection("sessions")
      .where("token", "==", token)
      .limit(1)
      .get();
    for (const doc of snap.docs) await doc.ref.delete();
  },

  async deleteByCustomerId(customerId: string): Promise<void> {
    const snap = await fdb
      .collection("sessions")
      .where("customerId", "==", customerId)
      .get();
    const batch = fdb.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
  },
};

// ── Orders ────────────────────────────────────────────────────────────────────

function toOrder(id: string, d: Record<string, unknown>): Order {
  return {
    id,
    razorpayOrderId: (d.razorpayOrderId as string | null) ?? null,
    razorpayPaymentId: (d.razorpayPaymentId as string | null) ?? null,
    customerName: (d.customerName as string) ?? "",
    customerEmail: (d.customerEmail as string) ?? "",
    customerEmailLower: (d.customerEmailLower as string) ?? "",
    customerPhone: (d.customerPhone as string) ?? "",
    shippingAddress: (d.shippingAddress as string) ?? "",
    totalAmount: (d.totalAmount as number) ?? 0,
    status: (d.status as string) ?? "pending",
    courierName: (d.courierName as string | null) ?? null,
    trackingId: (d.trackingId as string | null) ?? null,
    estimatedDelivery: (d.estimatedDelivery as string | null) ?? null,
    createdAt: fromTs(d.createdAt),
    updatedAt: fromTs(d.updatedAt),
  };
}

export const ordersCol = {
  async create(data: Omit<Order, "createdAt" | "updatedAt">): Promise<Order> {
    const now = new Date();
    const docData = { ...data, createdAt: now, updatedAt: now };
    await fdb.collection("orders").doc(data.id).set(docData);
    return toOrder(data.id, docData as unknown as Record<string, unknown>);
  },

  async findById(id: string): Promise<Order | null> {
    const snap = await fdb.collection("orders").doc(id).get();
    if (!snap.exists) return null;
    return toOrder(snap.id, snap.data() as Record<string, unknown>);
  },

  async findByPhone(phone: string): Promise<Order[]> {
    const snap = await fdb
      .collection("orders")
      .where("customerPhone", "==", phone)
      .get();
    return snap.docs
      .map((d) => toOrder(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findByEmail(email: string): Promise<Order[]> {
    const snap = await fdb
      .collection("orders")
      .where("customerEmailLower", "==", email.toLowerCase())
      .get();
    return snap.docs
      .map((d) => toOrder(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findAll(): Promise<Order[]> {
    const snap = await fdb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
  },

  async update(id: string, updates: Partial<Omit<Order, "id">>): Promise<void> {
    await fdb
      .collection("orders")
      .doc(id)
      .update({ ...updates, updatedAt: new Date() });
  },

  // Items
  async addItems(
    orderId: string,
    items: Omit<OrderItem, "id" | "orderId">[],
  ): Promise<OrderItem[]> {
    const batch = fdb.batch();
    const result: OrderItem[] = [];
    for (const item of items) {
      const ref = fdb.collection("orders").doc(orderId).collection("items").doc();
      batch.set(ref, { orderId, ...item });
      result.push({ id: ref.id, orderId, ...item });
    }
    await batch.commit();
    return result;
  },

  async getItems(orderId: string): Promise<OrderItem[]> {
    const snap = await fdb
      .collection("orders")
      .doc(orderId)
      .collection("items")
      .get();
    return snap.docs
      .filter((d) => !d.data()._note) // skip __schema marker docs
      .map((d) => ({
        id: d.id,
        orderId,
        ...(d.data() as Omit<OrderItem, "id" | "orderId">),
      }));
  },

  // Tracking
  async addTracking(
    orderId: string,
    step: Omit<TrackingStep, "id" | "orderId" | "timestamp">,
  ): Promise<TrackingStep> {
    const now = new Date();
    const ref = await fdb
      .collection("orders")
      .doc(orderId)
      .collection("tracking")
      .add({ orderId, ...step, timestamp: now });
    return { id: ref.id, orderId, ...step, timestamp: now };
  },

  async getTracking(orderId: string): Promise<TrackingStep[]> {
    const snap = await fdb
      .collection("orders")
      .doc(orderId)
      .collection("tracking")
      .orderBy("timestamp", "asc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        orderId,
        status: data.status as string,
        label: data.label as string,
        description: data.description as string,
        timestamp: fromTs(data.timestamp),
        completed: (data.completed as boolean) ?? true,
      };
    });
  },
};

// ── Issues (top-level) ────────────────────────────────────────────────────────

function toIssue(id: string, d: Record<string, unknown>): Issue {
  return {
    id,
    orderId: d.orderId as string,
    type: d.type as string,
    description: d.description as string,
    status: (d.status as string) ?? "open",
    adminReply: (d.adminReply as string | null) ?? null,
    createdAt: fromTs(d.createdAt),
  };
}

export const issuesCol = {
  async create(orderId: string, data: { type: string; description: string }): Promise<Issue> {
    const now = new Date();
    const docData = { orderId, ...data, status: "open", adminReply: null, createdAt: now };
    const ref = await fdb.collection("issues").add(docData);
    return { id: ref.id, ...docData };
  },

  async findAll(): Promise<Issue[]> {
    const snap = await fdb
      .collection("issues")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => toIssue(d.id, d.data() as Record<string, unknown>));
  },

  async findById(id: string): Promise<Issue | null> {
    const snap = await fdb.collection("issues").doc(id).get();
    if (!snap.exists) return null;
    return toIssue(snap.id, snap.data() as Record<string, unknown>);
  },

  async update(
    id: string,
    updates: { adminReply?: string; status?: string },
  ): Promise<Issue> {
    await fdb.collection("issues").doc(id).update(updates);
    const fresh = await this.findById(id);
    return fresh!;
  },
};

// ── Customer subcollections ───────────────────────────────────────────────────

export const addressesCol = {
  async findByCustomer(customerId: string): Promise<Address[]> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .get();
    const results = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        customerId,
        label: (data.label as string) ?? "Home",
        type: (data.type as string) ?? "home",
        recipientName: data.recipientName as string,
        phone: data.phone as string,
        line1: data.line1 as string,
        line2: (data.line2 as string) ?? "",
        city: data.city as string,
        state: data.state as string,
        pincode: data.pincode as string,
        country: (data.country as string) ?? "India",
        isDefault: (data.isDefault as boolean) ?? false,
        createdAt: fromTs(data.createdAt),
        updatedAt: fromTs(data.updatedAt),
      };
    });
    return results.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async count(customerId: string): Promise<number> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .count()
      .get();
    return snap.data().count;
  },

  async findById(customerId: string, addressId: string): Promise<Address | null> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .doc(addressId)
      .get();
    if (!snap.exists) return null;
    const data = snap.data() as Record<string, unknown>;
    return {
      id: snap.id,
      customerId,
      label: (data.label as string) ?? "Home",
      type: (data.type as string) ?? "home",
      recipientName: data.recipientName as string,
      phone: data.phone as string,
      line1: data.line1 as string,
      line2: (data.line2 as string) ?? "",
      city: data.city as string,
      state: data.state as string,
      pincode: data.pincode as string,
      country: (data.country as string) ?? "India",
      isDefault: (data.isDefault as boolean) ?? false,
      createdAt: fromTs(data.createdAt),
      updatedAt: fromTs(data.updatedAt),
    };
  },

  async create(
    customerId: string,
    data: Omit<Address, "id" | "customerId" | "createdAt" | "updatedAt">,
  ): Promise<Address> {
    const now = new Date();
    const docData = { customerId, ...data, createdAt: now, updatedAt: now };
    const ref = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .add(docData);
    return { id: ref.id, ...docData };
  },

  async update(
    customerId: string,
    addressId: string,
    updates: Partial<Omit<Address, "id" | "customerId">>,
  ): Promise<Address> {
    const now = new Date();
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .doc(addressId)
      .update({ ...updates, updatedAt: now });
    const fresh = await this.findById(customerId, addressId);
    return fresh!;
  },

  async clearDefault(customerId: string): Promise<void> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .where("isDefault", "==", true)
      .get();
    const batch = fdb.batch();
    for (const doc of snap.docs) batch.update(doc.ref, { isDefault: false });
    await batch.commit();
  },

  async setDefault(customerId: string, addressId: string): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .doc(addressId)
      .update({ isDefault: true });
  },

  async delete(customerId: string, addressId: string): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("addresses")
      .doc(addressId)
      .delete();
  },
};

export const wishlistCol = {
  async findByCustomer(customerId: string): Promise<WishlistItem[]> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("wishlist")
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        customerId,
        productId: data.productId as string,
        productName: data.productName as string,
        price: data.price as number,
        image: (data.image as string) ?? "",
        size: (data.size as string) ?? "",
        addedAt: fromTs(data.addedAt),
      };
    });
  },

  async findByProductId(customerId: string, productId: string): Promise<WishlistItem | null> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("wishlist")
      .where("productId", "==", productId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      customerId,
      productId: data.productId as string,
      productName: data.productName as string,
      price: data.price as number,
      image: (data.image as string) ?? "",
      size: (data.size as string) ?? "",
      addedAt: fromTs(data.addedAt),
    };
  },

  async add(
    customerId: string,
    data: Omit<WishlistItem, "id" | "customerId" | "addedAt">,
  ): Promise<WishlistItem> {
    const now = new Date();
    const docData = { customerId, ...data, addedAt: now };
    const ref = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("wishlist")
      .add(docData);
    return { id: ref.id, ...docData };
  },

  async remove(customerId: string, itemId: string): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("wishlist")
      .doc(itemId)
      .delete();
  },
};

export const reviewsCol = {
  /** Admin: fetch all reviews across all customers via collection-group query. */
  async findAllAdmin(): Promise<Review[]> {
    const snap = await fdb.collectionGroup("reviews").get();
    return snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          customerId: (data.customerId as string) ?? "",
          orderId: (data.orderId as string) ?? "",
          productId: (data.productId as string) ?? "",
          productName: (data.productName as string) ?? "",
          rating: (data.rating as number) ?? 0,
          title: (data.title as string) ?? "",
          body: (data.body as string) ?? "",
          images: (data.images as string[]) ?? [],
          status: (data.status as string) ?? "pending",
          adminReply: (data.adminReply as string) ?? "",
          helpfulCount: (data.helpfulCount as number) ?? 0,
          createdAt: fromTs(data.createdAt),
          updatedAt: fromTs(data.updatedAt),
        } as Review;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /** Admin: update status and/or reply on any customer's review. */
  async adminUpdate(
    customerId: string,
    reviewId: string,
    updates: { status?: string; adminReply?: string },
  ): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .doc(reviewId)
      .update({ ...updates, updatedAt: new Date() });
  },

  async findByCustomer(customerId: string): Promise<Review[]> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        customerId,
        orderId: data.orderId as string,
        productId: data.productId as string,
        productName: data.productName as string,
        rating: data.rating as number,
        title: (data.title as string) ?? "",
        body: data.body as string,
        images: (data.images as string[]) ?? [],
        status: (data.status as string) ?? "pending",
        adminReply: (data.adminReply as string) ?? "",
        helpfulCount: (data.helpfulCount as number) ?? 0,
        createdAt: fromTs(data.createdAt),
        updatedAt: fromTs(data.updatedAt),
      };
    });
  },

  async create(
    customerId: string,
    data: Pick<Review, "orderId" | "productId" | "productName" | "rating" | "title" | "body">,
  ): Promise<Review> {
    const now = new Date();
    const docData = {
      customerId,
      ...data,
      images: [],
      status: "pending",
      adminReply: "",
      helpfulCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .add(docData);
    return { id: ref.id, ...docData };
  },

  async update(
    customerId: string,
    reviewId: string,
    updates: Partial<Pick<Review, "rating" | "title" | "body">>,
  ): Promise<Review> {
    const now = new Date();
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .doc(reviewId)
      .update({ ...updates, status: "pending", updatedAt: now });
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .doc(reviewId)
      .get();
    const data = snap.data() as Record<string, unknown>;
    return {
      id: snap.id,
      customerId,
      orderId: data.orderId as string,
      productId: data.productId as string,
      productName: data.productName as string,
      rating: data.rating as number,
      title: (data.title as string) ?? "",
      body: data.body as string,
      images: (data.images as string[]) ?? [],
      status: (data.status as string) ?? "pending",
      adminReply: (data.adminReply as string) ?? "",
      helpfulCount: (data.helpfulCount as number) ?? 0,
      createdAt: fromTs(data.createdAt),
      updatedAt: fromTs(data.updatedAt),
    };
  },

  async delete(customerId: string, reviewId: string): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("reviews")
      .doc(reviewId)
      .delete();
  },
};

export const notificationsCol = {
  async findByCustomer(customerId: string): Promise<Notification[]> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        customerId,
        type: data.type as string,
        title: data.title as string,
        body: data.body as string,
        isRead: (data.isRead as boolean) ?? false,
        metadata: (data.metadata as Record<string, string>) ?? {},
        createdAt: fromTs(data.createdAt),
      };
    });
  },

  async create(data: Omit<Notification, "id" | "createdAt">): Promise<void> {
    await fdb
      .collection("customers")
      .doc(data.customerId)
      .collection("notifications")
      .add({ ...data, createdAt: new Date() });
  },

  async markRead(customerId: string, notificationId: string): Promise<void> {
    await fdb
      .collection("customers")
      .doc(customerId)
      .collection("notifications")
      .doc(notificationId)
      .update({ isRead: true });
  },

  async markAllRead(customerId: string): Promise<void> {
    const snap = await fdb
      .collection("customers")
      .doc(customerId)
      .collection("notifications")
      .where("isRead", "==", false)
      .get();
    const batch = fdb.batch();
    for (const doc of snap.docs) batch.update(doc.ref, { isRead: true });
    await batch.commit();
  },
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  size: string;
  batch: string;
  stock: number;
  threshold: number;
  incoming: number;
  expiry: string;
  supplier: string;
  cost: number;
  updatedAt: Date;
}

const SEED_INVENTORY: Omit<InventoryItem, "id" | "updatedAt">[] = [
  { productName: "Prawn Pickle",         sku: "KO-PP-100", size: "100g",  batch: "", stock: 0, threshold: 15, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Prawn Pickle",         sku: "KO-PP-250", size: "250g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Prawn Pickle",         sku: "KO-PP-500", size: "500g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Chicken Pickle",       sku: "KO-CP-100", size: "100g",  batch: "", stock: 0, threshold: 8,  incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Chicken Pickle",       sku: "KO-CP-250", size: "250g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Mutton Pickle",        sku: "KO-MP-100", size: "100g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Mutton Pickle",        sku: "KO-MP-250", size: "250g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Squid Pickle",         sku: "KO-SP-250", size: "250g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Squid Pickle",         sku: "KO-SP-500", size: "500g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Nethili Pickle",       sku: "KO-NP-100", size: "100g",  batch: "", stock: 0, threshold: 12, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Nethili Pickle",       sku: "KO-NP-250", size: "250g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Nethili Sambal",       sku: "KO-NS-100", size: "100g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Nethili Karuvaadu",    sku: "KO-NK-250", size: "250g",  batch: "", stock: 0, threshold: 8,  incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Soorai Pickle",        sku: "KO-SOP-100",size: "100g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Vaala Karuvaadu",      sku: "KO-VK-100", size: "100g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Maldives Fish Sambal", sku: "KO-MFS-100",size: "100g",  batch: "", stock: 0, threshold: 10, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Chennakunni Idly Podi",sku: "KO-IP-100", size: "100g",  batch: "", stock: 0, threshold: 20, incoming: 0, expiry: "", supplier: "", cost: 0 },
  { productName: "Chennakunni Idly Podi",sku: "KO-IP-200", size: "200g",  batch: "", stock: 0, threshold: 15, incoming: 0, expiry: "", supplier: "", cost: 0 },
];

function mapInventoryDoc(d: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): InventoryItem {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    productName: (data.productName as string) ?? "",
    sku: (data.sku as string) ?? "",
    size: (data.size as string) ?? "",
    batch: (data.batch as string) ?? "",
    stock: (data.stock as number) ?? 0,
    threshold: (data.threshold as number) ?? 10,
    incoming: (data.incoming as number) ?? 0,
    expiry: (data.expiry as string) ?? "",
    supplier: (data.supplier as string) ?? "",
    cost: (data.cost as number) ?? 0,
    updatedAt: fromTs(data.updatedAt),
  };
}

export const inventoryCol = {
  async findAll(): Promise<InventoryItem[]> {
    const snap = await fdb.collection("inventory").orderBy("productName").get();
    if (snap.empty) {
      await this.seed();
      const snap2 = await fdb.collection("inventory").orderBy("productName").get();
      return snap2.docs.map(mapInventoryDoc);
    }
    return snap.docs.map(mapInventoryDoc);
  },

  async seed(): Promise<void> {
    const batch = fdb.batch();
    for (const item of SEED_INVENTORY) {
      const ref = fdb.collection("inventory").doc();
      batch.set(ref, { ...item, updatedAt: new Date() });
    }
    await batch.commit();
  },

  async create(item: Omit<InventoryItem, "id" | "updatedAt">): Promise<string> {
    const ref = await fdb.collection("inventory").add({ ...item, updatedAt: new Date() });
    return ref.id;
  },

  async update(id: string, updates: Partial<Omit<InventoryItem, "id" | "updatedAt">>): Promise<void> {
    await fdb.collection("inventory").doc(id).update({ ...updates, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await fdb.collection("inventory").doc(id).delete();
  },
};
