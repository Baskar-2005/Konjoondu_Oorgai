import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  customersTable,
  addressesTable,
  wishlistTable,
  reviewsTable,
  notificationsTable,
  ordersTable,
  orderItemsTable,
  trackingStepsTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { getCustomerFromToken } from "./auth";
import { pbkdf2Sync, randomBytes } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 12000, 64, "sha512").toString("hex");
}

function safeCustomer(c: typeof customersTable.$inferSelect) {
  const { passwordHash, salt, pendingOtp, ...safe } = c;
  void passwordHash; void salt; void pendingOtp;
  return safe;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

// GET /customer/me
router.get("/customer/me", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const rows = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  if (!rows.length) { res.status(404).json({ success: false, message: "Customer not found." }); return; }
  res.json({ success: true, customer: safeCustomer(rows[0]) });
});

// PATCH /customer/me
router.patch("/customer/me", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { name, email, dob, gender, profilePicture, communicationPrefs, isFirstLogin } =
    req.body as {
      name?: string; email?: string; dob?: string; gender?: string;
      profilePicture?: string; communicationPrefs?: Record<string, boolean>;
      isFirstLogin?: boolean;
    };
  const updates: Partial<typeof customersTable.$inferInsert> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (dob !== undefined) updates.dob = dob;
  if (gender !== undefined) updates.gender = gender;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;
  if (communicationPrefs !== undefined) updates.communicationPrefs = communicationPrefs as { email: boolean; sms: boolean; whatsapp: boolean };
  if (isFirstLogin !== undefined) updates.isFirstLogin = isFirstLogin;

  await db.update(customersTable).set(updates).where(eq(customersTable.id, customerId));
  const updated = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  res.json({ success: true, customer: safeCustomer(updated[0]) });
});

// PATCH /customer/me/password
router.patch("/customer/me/password", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: "currentPassword and newPassword required." }); return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." }); return;
  }
  const rows = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  const customer = rows[0];
  if (!customer) {
    res.status(404).json({ success: false, message: "Customer not found." }); return;
  }
  const hash = hashPassword(currentPassword, customer.salt);
  if (hash !== customer.passwordHash) {
    res.status(401).json({ success: false, message: "Current password is incorrect." }); return;
  }
  const newSalt = randomBytes(32).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);
  await db.update(customersTable).set({ passwordHash: newHash, salt: newSalt, updatedAt: new Date() }).where(eq(customersTable.id, customerId));
  res.json({ success: true, message: "Password updated." });
});

// ─── Addresses ────────────────────────────────────────────────────────────────

// GET /customer/addresses
router.get("/customer/addresses", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const addresses = await db.select().from(addressesTable)
    .where(eq(addressesTable.customerId, customerId))
    .orderBy(desc(addressesTable.isDefault), desc(addressesTable.createdAt));
  res.json({ success: true, addresses });
});

// POST /customer/addresses
router.post("/customer/addresses", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { label, type, recipientName, phone, line1, line2, city, state, pincode, country, isDefault } =
    req.body as { label?: string; type?: string; recipientName?: string; phone?: string;
      line1?: string; line2?: string; city?: string; state?: string; pincode?: string;
      country?: string; isDefault?: boolean };
  if (!recipientName || !phone || !line1 || !city || !state || !pincode) {
    res.status(400).json({ success: false, message: "Required fields missing." }); return;
  }
  if (isDefault) {
    await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.customerId, customerId));
  }
  const existing = await db.select().from(addressesTable).where(eq(addressesTable.customerId, customerId));
  const makeDefault = isDefault || existing.length === 0;
  const [address] = await db.insert(addressesTable).values({
    customerId, label: label || "Home", type: type || "home", recipientName, phone,
    line1, line2: line2 || "", city, state, pincode, country: country || "India", isDefault: makeDefault,
  }).returning();
  res.status(201).json({ success: true, address });
});

// PATCH /customer/addresses/:id
router.patch("/customer/addresses/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const id = Number(req.params.id);
  const rows = await db.select().from(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.customerId, customerId)));
  if (!rows.length) { res.status(404).json({ success: false, message: "Address not found." }); return; }
  const { label, type, recipientName, phone, line1, line2, city, state, pincode, country } = req.body;
  const updates: Partial<typeof addressesTable.$inferInsert> = { updatedAt: new Date() };
  if (label !== undefined) updates.label = label;
  if (type !== undefined) updates.type = type;
  if (recipientName !== undefined) updates.recipientName = recipientName;
  if (phone !== undefined) updates.phone = phone;
  if (line1 !== undefined) updates.line1 = line1;
  if (line2 !== undefined) updates.line2 = line2;
  if (city !== undefined) updates.city = city;
  if (state !== undefined) updates.state = state;
  if (pincode !== undefined) updates.pincode = pincode;
  if (country !== undefined) updates.country = country;
  const [updated] = await db.update(addressesTable).set(updates).where(eq(addressesTable.id, id)).returning();
  res.json({ success: true, address: updated });
});

// PATCH /customer/addresses/:id/default
router.patch("/customer/addresses/:id/default", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const id = Number(req.params.id);
  await db.update(addressesTable).set({ isDefault: false }).where(eq(addressesTable.customerId, customerId));
  await db.update(addressesTable).set({ isDefault: true }).where(and(eq(addressesTable.id, id), eq(addressesTable.customerId, customerId)));
  res.json({ success: true });
});

// DELETE /customer/addresses/:id
router.delete("/customer/addresses/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const id = Number(req.params.id);
  await db.delete(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.customerId, customerId)));
  res.json({ success: true });
});

// ─── Orders (customer view) ───────────────────────────────────────────────────

// GET /customer/orders
router.get("/customer/orders", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const rows = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
  if (!rows.length) { res.status(404).json({ success: false, message: "Customer not found." }); return; }
  const phone = rows[0].phone;
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.customerPhone, phone))
    .orderBy(desc(ordersTable.createdAt));
  const enriched = await Promise.all(
    orders.map(async (o: typeof ordersTable.$inferSelect) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
      const steps = await db.select().from(trackingStepsTable).where(eq(trackingStepsTable.orderId, o.id)).orderBy(trackingStepsTable.timestamp);
      return { ...o, items, trackingSteps: steps };
    })
  );
  res.json({ success: true, orders: enriched, total: enriched.length });
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

// GET /customer/wishlist
router.get("/customer/wishlist", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const items = await db.select().from(wishlistTable)
    .where(eq(wishlistTable.customerId, customerId))
    .orderBy(desc(wishlistTable.addedAt));
  res.json({ success: true, items });
});

// POST /customer/wishlist
router.post("/customer/wishlist", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { productId, productName, price, image, size } = req.body as {
    productId?: string; productName?: string; price?: number; image?: string; size?: string;
  };
  if (!productId || !productName || price === undefined) {
    res.status(400).json({ success: false, message: "productId, productName, price required." }); return;
  }
  // Check for duplicate
  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.customerId, customerId), eq(wishlistTable.productId, String(productId))));
  if (existing.length) {
    res.json({ success: true, item: existing[0], alreadyAdded: true }); return;
  }
  const [item] = await db.insert(wishlistTable).values({
    customerId, productId: String(productId), productName, price, image: image || "", size: size || "",
  }).returning();
  res.status(201).json({ success: true, item });
});

// DELETE /customer/wishlist/:id
router.delete("/customer/wishlist/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await db.delete(wishlistTable).where(and(eq(wishlistTable.id, Number(req.params.id)), eq(wishlistTable.customerId, customerId)));
  res.json({ success: true });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

// GET /customer/reviews
router.get("/customer/reviews", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.customerId, customerId))
    .orderBy(desc(reviewsTable.createdAt));
  res.json({ success: true, reviews });
});

// POST /customer/reviews
router.post("/customer/reviews", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { orderId, productId, productName, rating, title, body } = req.body as {
    orderId?: string; productId?: string; productName?: string;
    rating?: number; title?: string; body?: string;
  };
  if (!orderId || !productId || !productName || !rating || !body) {
    res.status(400).json({ success: false, message: "Required fields missing." }); return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ success: false, message: "Rating must be 1-5." }); return;
  }
  const [review] = await db.insert(reviewsTable).values({
    customerId, orderId, productId, productName, rating, title: title || "", body,
  }).returning();

  // Create notification for admin awareness (stored as system notification)
  await db.insert(notificationsTable).values({
    customerId,
    type: "review_submitted",
    title: "Review Submitted",
    body: `Your review for ${productName} has been submitted and is pending approval.`,
    metadata: { reviewId: String(review.id), productId },
  });

  res.status(201).json({ success: true, review });
});

// PATCH /customer/reviews/:id
router.patch("/customer/reviews/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const id = Number(req.params.id);
  const { rating, title, body } = req.body as { rating?: number; title?: string; body?: string };
  const updates: Partial<typeof reviewsTable.$inferInsert> = { updatedAt: new Date(), status: "pending" };
  if (rating !== undefined) updates.rating = rating;
  if (title !== undefined) updates.title = title;
  if (body !== undefined) updates.body = body;
  const [updated] = await db.update(reviewsTable).set(updates)
    .where(and(eq(reviewsTable.id, id), eq(reviewsTable.customerId, customerId)))
    .returning();
  res.json({ success: true, review: updated });
});

// DELETE /customer/reviews/:id
router.delete("/customer/reviews/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await db.delete(reviewsTable).where(and(eq(reviewsTable.id, Number(req.params.id)), eq(reviewsTable.customerId, customerId)));
  res.json({ success: true });
});

// ─── Notifications ────────────────────────────────────────────────────────────

// GET /customer/notifications
router.get("/customer/notifications", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.customerId, customerId))
    .orderBy(desc(notificationsTable.createdAt));
  res.json({ success: true, notifications });
});

// PATCH /customer/notifications/:id/read
router.patch("/customer/notifications/:id/read", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await db.update(notificationsTable).set({ isRead: true })
    .where(and(eq(notificationsTable.id, Number(req.params.id)), eq(notificationsTable.customerId, customerId)));
  res.json({ success: true });
});

// PATCH /customer/notifications/read-all
router.patch("/customer/notifications/read-all", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.customerId, customerId));
  res.json({ success: true });
});

export default router;
