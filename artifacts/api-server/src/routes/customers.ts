import { Router, type IRouter } from "express";
import { pbkdf2Sync, randomBytes } from "crypto";
import { getCustomerFromToken } from "./auth";
import {
  customersCol,
  addressesCol,
  wishlistCol,
  reviewsCol,
  notificationsCol,
  ordersCol,
} from "../lib/firestoreDb";
import type { Customer } from "../lib/firestoreDb";

const router: IRouter = Router();

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 12000, 64, "sha512").toString("hex");
}

function safeCustomer(c: Customer) {
  const { passwordHash, salt, pendingOtp, ...safe } = c;
  void passwordHash; void salt; void pendingOtp;
  return safe;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get("/customer/me", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const customer = await customersCol.findById(customerId);
  if (!customer) { res.status(404).json({ success: false, message: "Customer not found." }); return; }
  res.json({ success: true, customer: safeCustomer(customer) });
});

router.patch("/customer/me", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { name, email, dob, gender, profilePicture, communicationPrefs, isFirstLogin } = req.body as {
    name?: string; email?: string; dob?: string; gender?: string;
    profilePicture?: string; communicationPrefs?: Record<string, boolean>; isFirstLogin?: boolean;
  };
  const updates: Partial<Customer> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (dob !== undefined) updates.dob = dob;
  if (gender !== undefined) updates.gender = gender;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;
  if (communicationPrefs !== undefined) updates.communicationPrefs = communicationPrefs as Customer["communicationPrefs"];
  if (isFirstLogin !== undefined) updates.isFirstLogin = isFirstLogin;
  const updated = await customersCol.update(customerId, updates);
  res.json({ success: true, customer: safeCustomer(updated) });
});

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
  const customer = await customersCol.findById(customerId);
  if (!customer) { res.status(404).json({ success: false, message: "Customer not found." }); return; }
  if (hashPassword(currentPassword, customer.salt) !== customer.passwordHash) {
    res.status(401).json({ success: false, message: "Current password is incorrect." }); return;
  }
  const newSalt = randomBytes(32).toString("hex");
  await customersCol.update(customerId, { passwordHash: hashPassword(newPassword, newSalt), salt: newSalt });
  res.json({ success: true, message: "Password updated." });
});

// ─── Addresses ────────────────────────────────────────────────────────────────

router.get("/customer/addresses", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const addresses = await addressesCol.findByCustomer(customerId);
  res.json({ success: true, addresses });
});

router.post("/customer/addresses", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { label, type, recipientName, phone, line1, line2, city, state, pincode, country, isDefault } = req.body as {
    label?: string; type?: string; recipientName?: string; phone?: string;
    line1?: string; line2?: string; city?: string; state?: string; pincode?: string;
    country?: string; isDefault?: boolean;
  };
  if (!recipientName || !phone || !line1 || !city || !state || !pincode) {
    res.status(400).json({ success: false, message: "Required fields missing." }); return;
  }
  if (isDefault) await addressesCol.clearDefault(customerId);
  const existingCount = await addressesCol.count(customerId);
  const makeDefault = isDefault || existingCount === 0;
  const address = await addressesCol.create(customerId, {
    label: label || "Home", type: type || "home", recipientName, phone,
    line1, line2: line2 || "", city, state, pincode, country: country || "India", isDefault: makeDefault,
  });
  res.status(201).json({ success: true, address });
});

router.patch("/customer/addresses/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const existing = await addressesCol.findById(customerId, req.params.id);
  if (!existing) { res.status(404).json({ success: false, message: "Address not found." }); return; }
  const { label, type, recipientName, phone, line1, line2, city, state, pincode, country } = req.body;
  const updates: Record<string, unknown> = {};
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
  const updated = await addressesCol.update(customerId, req.params.id, updates);
  res.json({ success: true, address: updated });
});

router.patch("/customer/addresses/:id/default", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await addressesCol.clearDefault(customerId);
  await addressesCol.setDefault(customerId, req.params.id);
  res.json({ success: true });
});

router.delete("/customer/addresses/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await addressesCol.delete(customerId, req.params.id);
  res.json({ success: true });
});

// ─── Orders (customer view) ───────────────────────────────────────────────────

router.get("/customer/orders", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const customer = await customersCol.findById(customerId);
  if (!customer) { res.status(404).json({ success: false, message: "Customer not found." }); return; }
  const orders = await ordersCol.findByPhone(customer.phone);
  const enriched = await Promise.all(
    orders.map(async (o) => {
      const [items, trackingSteps] = await Promise.all([
        ordersCol.getItems(o.id),
        ordersCol.getTracking(o.id),
      ]);
      return { ...o, items, trackingSteps };
    }),
  );
  res.json({ success: true, orders: enriched, total: enriched.length });
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────

router.get("/customer/wishlist", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  res.json({ success: true, items: await wishlistCol.findByCustomer(customerId) });
});

router.post("/customer/wishlist", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { productId, productName, price, image, size } = req.body as {
    productId?: string; productName?: string; price?: number; image?: string; size?: string;
  };
  if (!productId || !productName || price === undefined) {
    res.status(400).json({ success: false, message: "productId, productName, price required." }); return;
  }
  const existing = await wishlistCol.findByProductId(customerId, String(productId));
  if (existing) { res.json({ success: true, item: existing, alreadyAdded: true }); return; }
  const item = await wishlistCol.add(customerId, {
    productId: String(productId), productName, price, image: image || "", size: size || "",
  });
  res.status(201).json({ success: true, item });
});

router.delete("/customer/wishlist/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await wishlistCol.remove(customerId, req.params.id);
  res.json({ success: true });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

router.get("/customer/reviews", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  res.json({ success: true, reviews: await reviewsCol.findByCustomer(customerId) });
});

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
  const review = await reviewsCol.create(customerId, {
    orderId, productId, productName, rating, title: title || "", body,
  });
  await notificationsCol.create({
    customerId, type: "review_submitted", title: "Review Submitted",
    body: `Your review for ${productName} has been submitted and is pending approval.`,
    isRead: false, metadata: { reviewId: review.id, productId },
  });
  res.status(201).json({ success: true, review });
});

router.patch("/customer/reviews/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { rating, title, body } = req.body as { rating?: number; title?: string; body?: string };
  const updates: Record<string, unknown> = {};
  if (rating !== undefined) updates.rating = rating;
  if (title !== undefined) updates.title = title;
  if (body !== undefined) updates.body = body;
  const updated = await reviewsCol.update(customerId, req.params.id, updates);
  res.json({ success: true, review: updated });
});

router.delete("/customer/reviews/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await reviewsCol.delete(customerId, req.params.id);
  res.json({ success: true });
});

// ─── Notifications ────────────────────────────────────────────────────────────

router.get("/customer/notifications", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  res.json({ success: true, notifications: await notificationsCol.findByCustomer(customerId) });
});

router.patch("/customer/notifications/:id/read", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await notificationsCol.markRead(customerId, req.params.id);
  res.json({ success: true });
});

router.patch("/customer/notifications/read-all", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  await notificationsCol.markAllRead(customerId);
  res.json({ success: true });
});

export default router;
