import { Router, type IRouter } from "express";
import { pbkdf2Sync, randomBytes } from "crypto";
import { getCustomerFromToken } from "./auth";
import {
  customersCol, addressesCol, wishlistCol, reviewsCol, notificationsCol, ordersCol,
} from "../lib/firestoreDb";
import type { Customer } from "../lib/firestoreDb";
import {
  isValidPhone, isValidEmail, sanitizeString, normalizePhone, LIMITS,
} from "../lib/validate";

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
  const { name, email, phone, dob, gender, profilePicture, communicationPrefs, isFirstLogin } = req.body as {
    name?: string; email?: string; phone?: string; dob?: string; gender?: string;
    profilePicture?: string; communicationPrefs?: Record<string, boolean>; isFirstLogin?: boolean;
  };
  const updates: Partial<Customer> = {};

  if (name !== undefined) {
    const cleanName = sanitizeString(name, LIMITS.NAME);
    if (!cleanName) { res.status(400).json({ success: false, message: "Name cannot be empty." }); return; }
    updates.name = cleanName;
  }
  if (email !== undefined) {
    const cleanEmail = sanitizeString(email, LIMITS.EMAIL).toLowerCase();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      res.status(400).json({ success: false, message: "Invalid email format." }); return;
    }
    updates.email = cleanEmail;
  }
  if (phone !== undefined) {
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      res.status(400).json({ success: false, message: "Invalid phone number format." }); return;
    }
    updates.phone = cleanPhone;
  }
  if (dob !== undefined) {
    // Accept ISO date strings only (YYYY-MM-DD)
    const cleanDob = sanitizeString(dob, 10);
    if (cleanDob && !/^\d{4}-\d{2}-\d{2}$/.test(cleanDob)) {
      res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." }); return;
    }
    updates.dob = cleanDob;
  }
  if (gender !== undefined) {
    const allowed = ["male", "female", "other", "prefer_not_to_say", ""];
    const cleanGender = sanitizeString(gender, 20).toLowerCase();
    if (!allowed.includes(cleanGender)) {
      res.status(400).json({ success: false, message: "Invalid gender value." }); return;
    }
    updates.gender = cleanGender;
  }
  if (profilePicture !== undefined) {
    // Only allow https:// URLs or empty string — no javascript: or data: URLs
    const cleanPic = sanitizeString(profilePicture, 500);
    if (cleanPic && !/^https?:\/\/.+/.test(cleanPic)) {
      res.status(400).json({ success: false, message: "Profile picture must be a valid HTTPS URL." }); return;
    }
    updates.profilePicture = cleanPic;
  }
  if (communicationPrefs !== undefined) {
    if (typeof communicationPrefs !== "object" || communicationPrefs === null) {
      res.status(400).json({ success: false, message: "Invalid communicationPrefs." }); return;
    }
    updates.communicationPrefs = {
      email: Boolean(communicationPrefs.email),
      sms: Boolean(communicationPrefs.sms),
      whatsapp: Boolean(communicationPrefs.whatsapp),
    } as Customer["communicationPrefs"];
  }
  if (isFirstLogin !== undefined) updates.isFirstLogin = Boolean(isFirstLogin);

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
  if (currentPassword.length > LIMITS.PASSWORD_MAX || newPassword.length > LIMITS.PASSWORD_MAX) {
    res.status(400).json({ success: false, message: "Password is too long." }); return;
  }
  if (newPassword.length < LIMITS.PASSWORD_MIN) {
    res.status(400).json({ success: false, message: `Password must be at least ${LIMITS.PASSWORD_MIN} characters.` }); return;
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

  const cleanRecipientName = sanitizeString(recipientName, LIMITS.NAME);
  const cleanPhone = phone ? normalizePhone(phone) : "";
  const cleanLine1 = sanitizeString(line1, LIMITS.ADDRESS_LINE);
  const cleanCity = sanitizeString(city, LIMITS.CITY);
  const cleanState = sanitizeString(state, LIMITS.STATE);
  const cleanPincode = sanitizeString(pincode, LIMITS.PINCODE).replace(/\s/g, "");

  if (!cleanRecipientName || !cleanPhone || !cleanLine1 || !cleanCity || !cleanState || !cleanPincode) {
    res.status(400).json({ success: false, message: "Required fields missing." }); return;
  }
  if (!isValidPhone(cleanPhone)) {
    res.status(400).json({ success: false, message: "Invalid phone number format." }); return;
  }
  // India: 6-digit pincode
  if (!/^\d{6}$/.test(cleanPincode)) {
    res.status(400).json({ success: false, message: "Invalid PIN code. Must be 6 digits." }); return;
  }

  if (isDefault) await addressesCol.clearDefault(customerId);
  const existingCount = await addressesCol.count(customerId);
  const makeDefault = isDefault || existingCount === 0;
  const address = await addressesCol.create(customerId, {
    label: sanitizeString(label, 50) || "Home",
    type: sanitizeString(type, 20) || "home",
    recipientName: cleanRecipientName,
    phone: cleanPhone,
    line1: cleanLine1,
    line2: sanitizeString(line2, LIMITS.ADDRESS_LINE),
    city: cleanCity,
    state: cleanState,
    pincode: cleanPincode,
    country: sanitizeString(country, LIMITS.COUNTRY) || "India",
    isDefault: makeDefault,
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

  if (label !== undefined) updates.label = sanitizeString(label, 50);
  if (type !== undefined) updates.type = sanitizeString(type, 20);
  if (recipientName !== undefined) {
    const clean = sanitizeString(recipientName, LIMITS.NAME);
    if (!clean) { res.status(400).json({ success: false, message: "Recipient name cannot be empty." }); return; }
    updates.recipientName = clean;
  }
  if (phone !== undefined) {
    const cleanPhone = normalizePhone(phone);
    if (!isValidPhone(cleanPhone)) { res.status(400).json({ success: false, message: "Invalid phone number." }); return; }
    updates.phone = cleanPhone;
  }
  if (line1 !== undefined) updates.line1 = sanitizeString(line1, LIMITS.ADDRESS_LINE);
  if (line2 !== undefined) updates.line2 = sanitizeString(line2, LIMITS.ADDRESS_LINE);
  if (city !== undefined) updates.city = sanitizeString(city, LIMITS.CITY);
  if (state !== undefined) updates.state = sanitizeString(state, LIMITS.STATE);
  if (pincode !== undefined) {
    const cleanPin = sanitizeString(pincode, LIMITS.PINCODE).replace(/\s/g, "");
    if (!/^\d{6}$/.test(cleanPin)) { res.status(400).json({ success: false, message: "Invalid PIN code. Must be 6 digits." }); return; }
    updates.pincode = cleanPin;
  }
  if (country !== undefined) updates.country = sanitizeString(country, LIMITS.COUNTRY);

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

  if (!customer.email) {
    res.json({ success: true, orders: [], total: 0 });
    return;
  }
  const matched = await ordersCol.findByEmail(customer.email);

  const enriched = await Promise.all(
    matched.map(async (o) => {
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
  const cleanProductName = sanitizeString(productName, LIMITS.PRODUCT_NAME);
  const cleanSize = sanitizeString(size, 50);
  // Only allow https:// image URLs or empty string
  const rawImage = String(image || "");
  const cleanImage = /^https?:\/\/.+/.test(rawImage) ? rawImage.slice(0, 500) : "";

  const existing = await wishlistCol.findByProductId(customerId, String(productId));
  if (existing) { res.json({ success: true, item: existing, alreadyAdded: true }); return; }
  const item = await wishlistCol.add(customerId, {
    productId: String(productId).slice(0, 50),
    productName: cleanProductName,
    price: Math.abs(Number(price)) || 0,
    image: cleanImage,
    size: cleanSize,
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
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    res.status(400).json({ success: false, message: "Rating must be 1–5." }); return;
  }
  const cleanTitle = sanitizeString(title, LIMITS.REVIEW_TITLE);
  const cleanBody = sanitizeString(body, LIMITS.REVIEW_BODY);
  if (!cleanBody) {
    res.status(400).json({ success: false, message: "Review body cannot be empty." }); return;
  }
  const cleanProductName = sanitizeString(productName, LIMITS.PRODUCT_NAME);

  const review = await reviewsCol.create(customerId, {
    orderId: String(orderId).slice(0, 50),
    productId: String(productId).slice(0, 50),
    productName: cleanProductName,
    rating: numRating,
    title: cleanTitle,
    body: cleanBody,
  });
  await notificationsCol.create({
    customerId, type: "review_submitted", title: "Review Submitted",
    body: `Your review for ${cleanProductName} has been submitted and is pending approval.`,
    isRead: false, metadata: { reviewId: review.id, productId: String(productId) },
  });
  res.status(201).json({ success: true, review });
});

router.patch("/customer/reviews/:id", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { rating, title, body } = req.body as { rating?: number; title?: string; body?: string };
  const updates: Record<string, unknown> = {};
  if (rating !== undefined) {
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ success: false, message: "Rating must be 1–5." }); return;
    }
    updates.rating = numRating;
  }
  if (title !== undefined) updates.title = sanitizeString(title, LIMITS.REVIEW_TITLE);
  if (body !== undefined) {
    const cleanBody = sanitizeString(body, LIMITS.REVIEW_BODY);
    if (!cleanBody) { res.status(400).json({ success: false, message: "Review body cannot be empty." }); return; }
    updates.body = cleanBody;
  }
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
