import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes, pbkdf2Sync } from "crypto";
import { randomUUID } from "crypto";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { customersCol, sessionsCol, notificationsCol } from "../lib/firestoreDb";
import type { Customer } from "../lib/firestoreDb";
import { fdb } from "../lib/firebase";
import {
  isValidPhone, isValidEmail, sanitizeString, normalizePhone, LIMITS,
} from "../lib/validate";

const router: IRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 12000, 64, "sha512").toString("hex");
}

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

async function createSession(customerId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await sessionsCol.create(customerId, token, expiresAt);
  return token;
}

export async function getCustomerFromToken(
  req: Request,
  res: Response,
): Promise<string | null> {
  const token = req.headers["x-customer-token"] as string | undefined;
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return null;
  }
  // Basic token format check
  if (typeof token !== "string" || token.length > 200 || !/^[a-f0-9]+$/.test(token)) {
    res.status(401).json({ success: false, message: "Invalid token format." });
    return null;
  }
  const session = await sessionsCol.findByToken(token);
  if (!session || new Date() > session.expiresAt) {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    return null;
  }
  return session.customerId;
}

function safeCustomer(c: Customer) {
  const { passwordHash, salt, pendingOtp, ...safe } = c;
  void passwordHash; void salt; void pendingOtp;
  return safe;
}

function validatePassword(password: string): string | null {
  if (password.length < LIMITS.PASSWORD_MIN) return `Password must be at least ${LIMITS.PASSWORD_MIN} characters.`;
  if (password.length > LIMITS.PASSWORD_MAX) return "Password is too long.";
  return null;
}

async function verifyFirebasePhoneToken(idToken: string): Promise<string | null> {
  try {
    void (fdb as unknown as { _dummy?: unknown })._dummy;
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.phone_number ?? null;
  } catch {
    return null;
  }
}

async function verifyFirebaseToken(idToken: string) {
  try {
    void (fdb as unknown as { _dummy?: unknown })._dummy;
    return await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return null;
  }
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
  const { firebaseToken, password } = req.body as {
    firebaseToken?: string;
    password?: string;
  };

  if (!firebaseToken?.trim() || !password) {
    res.status(400).json({ success: false, message: "Firebase token and password are required." });
    return;
  }
  if (firebaseToken.length > 2000) {
    res.status(400).json({ success: false, message: "Invalid token." });
    return;
  }

  const pwErr = validatePassword(password);
  if (pwErr) { res.status(400).json({ success: false, message: pwErr }); return; }

  const phone = await verifyFirebasePhoneToken(firebaseToken);
  if (!phone) {
    res.status(401).json({ success: false, message: "Phone verification failed. Please try again." });
    return;
  }

  const existing = await customersCol.findByPhone(phone);
  if (existing?.isVerified && existing.passwordHash) {
    res.status(400).json({ success: false, message: "An account with this phone already exists. Please log in." });
    return;
  }

  let customer = existing;
  if (!customer) {
    const id = "CUST-" + randomUUID().slice(0, 8).toUpperCase();
    const salt = randomBytes(32).toString("hex");
    customer = await customersCol.create(id, {
      phone,
      email: "",
      name: "",
      dob: "",
      gender: "",
      passwordHash: "",
      salt,
      profilePicture: "",
      rewardPoints: 0,
      isVerified: false,
      isFirstLogin: true,
      pendingOtp: "",
      otpExpiry: null,
      communicationPrefs: { email: true, sms: true, whatsapp: true },
    });
  }

  const salt = customer.salt || randomBytes(32).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const updated = await customersCol.update(customer.id, {
    passwordHash, salt, isVerified: true, isFirstLogin: true, pendingOtp: "", otpExpiry: null,
  });

  const token = await createSession(customer.id);

  await notificationsCol.create({
    customerId: customer.id,
    type: "order_update",
    title: "Welcome to Konjoondu Oorgai! 🥒",
    body: "Your account is ready. Browse our handcrafted pickle range and place your first order.",
    isRead: false,
    metadata: {},
  });

  res.status(201).json({ success: true, token, customer: safeCustomer(updated) });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone?.trim() || !password) {
    res.status(400).json({ success: false, message: "Phone and password are required." });
    return;
  }
  if (phone.length > LIMITS.PHONE || password.length > LIMITS.PASSWORD_MAX) {
    res.status(400).json({ success: false, message: "Invalid credentials." });
    return;
  }

  const normalised = normalizePhone(phone);
  if (!isValidPhone(normalised)) {
    res.status(400).json({ success: false, message: "Invalid phone number format." });
    return;
  }

  const customer = await customersCol.findByPhone(normalised);

  if (!customer || !customer.isVerified || !customer.passwordHash) {
    res.status(401).json({ success: false, message: "No account found. Please register." });
    return;
  }

  const hash = hashPassword(password, customer.salt);
  if (hash !== customer.passwordHash) {
    res.status(401).json({ success: false, message: "Incorrect password." });
    return;
  }

  const token = await createSession(customer.id);
  res.json({ success: true, token, customer: safeCustomer(customer) });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/auth/logout", async (req, res) => {
  const token = req.headers["x-customer-token"] as string | undefined;
  if (token && typeof token === "string" && token.length <= 200) {
    await sessionsCol.deleteByToken(token);
  }
  res.json({ success: true });
});

// ─── POST /auth/forgot-password ───────────────────────────────────────────────
router.post("/auth/forgot-password", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone?.trim()) {
    res.status(400).json({ success: false, message: "Phone number is required." });
    return;
  }
  const normalised = normalizePhone(phone);
  if (!isValidPhone(normalised)) {
    res.status(400).json({ success: false, message: "Invalid phone number format." });
    return;
  }
  const customer = await customersCol.findByPhone(normalised);
  if (!customer || !customer.isVerified) {
    // Generic message — don't reveal whether phone exists
    res.json({ success: true, message: "If an account exists for this phone, you may proceed with OTP." });
    return;
  }
  res.json({ success: true, message: "Phone verified. Proceed with OTP." });
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
router.post("/auth/reset-password", async (req, res) => {
  const { firebaseToken, newPassword } = req.body as {
    firebaseToken?: string;
    newPassword?: string;
  };
  if (!firebaseToken?.trim() || !newPassword) {
    res.status(400).json({ success: false, message: "Firebase token and new password are required." });
    return;
  }
  if (firebaseToken.length > 2000) {
    res.status(400).json({ success: false, message: "Invalid token." });
    return;
  }

  const pwErr = validatePassword(newPassword);
  if (pwErr) { res.status(400).json({ success: false, message: pwErr }); return; }

  const phone = await verifyFirebasePhoneToken(firebaseToken);
  if (!phone) {
    res.status(401).json({ success: false, message: "Phone verification failed. Please try again." });
    return;
  }

  const customer = await customersCol.findByPhone(phone);
  if (!customer || !customer.isVerified) {
    res.status(404).json({ success: false, message: "No verified account found for this phone." });
    return;
  }

  const passwordHash = hashPassword(newPassword, customer.salt);
  const updated = await customersCol.update(customer.id, { passwordHash });
  await sessionsCol.deleteByCustomerId(customer.id);
  const token = await createSession(customer.id);
  res.json({ success: true, token, customer: safeCustomer(updated) });
});

// ─── POST /auth/google ────────────────────────────────────────────────────────
router.post("/auth/google", async (req, res) => {
  const { firebaseToken } = req.body as { firebaseToken?: string };
  if (!firebaseToken?.trim()) {
    res.status(400).json({ success: false, message: "Firebase token is required." });
    return;
  }
  if (firebaseToken.length > 2000) {
    res.status(400).json({ success: false, message: "Invalid token." });
    return;
  }

  const decoded = await verifyFirebaseToken(firebaseToken);
  const provider = (decoded?.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
  if (!decoded || !decoded.email || provider !== "google.com" || !decoded.email_verified) {
    res.status(401).json({ success: false, message: "Google sign-in verification failed." });
    return;
  }

  const email = decoded.email.toLowerCase();
  const name = sanitizeString((decoded.name as string | undefined) ?? "", LIMITS.NAME);
  const picture = (decoded.picture as string | undefined) ?? "";

  let customer = await customersCol.findByEmail(email);

  if (!customer) {
    const id = "CUST-" + randomUUID().slice(0, 8).toUpperCase();
    customer = await customersCol.create(id, {
      phone: "",
      email,
      name,
      dob: "",
      gender: "",
      passwordHash: "",
      salt: "",
      profilePicture: picture,
      rewardPoints: 0,
      isVerified: true,
      isFirstLogin: true,
      pendingOtp: "",
      otpExpiry: null,
      communicationPrefs: { email: true, sms: true, whatsapp: true },
    });

    await notificationsCol.create({
      customerId: customer.id,
      type: "order_update",
      title: "Welcome to Konjoondu Oorgai! 🥒",
      body: "Your account is ready. Browse our handcrafted pickle range and place your first order.",
      isRead: false,
      metadata: {},
    });
  } else if (!customer.name && name) {
    customer = await customersCol.update(customer.id, { name });
  }

  const token = await createSession(customer.id);
  res.json({ success: true, token, customer: safeCustomer(customer) });
});

export default router;
