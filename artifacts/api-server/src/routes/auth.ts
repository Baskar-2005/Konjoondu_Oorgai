import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes, pbkdf2Sync } from "crypto";
import { randomUUID } from "crypto";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { customersCol, sessionsCol, notificationsCol } from "../lib/firestoreDb";
import type { Customer } from "../lib/firestoreDb";
import { fdb } from "../lib/firebase";

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
  const session = await sessionsCol.findByToken(token);
  if (!session || new Date() > session.expiresAt) {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    return null;
  }
  return session.customerId;
}

function safeCustomer(c: Customer) {
  const { passwordHash, salt, pendingOtp, ...safe } = c;
  void passwordHash;
  void salt;
  void pendingOtp;
  return safe;
}

/**
 * Verify a Firebase Phone Auth ID token and return the verified phone number.
 * Returns null if the token is invalid.
 */
async function verifyFirebasePhoneToken(idToken: string): Promise<string | null> {
  try {
    // Access fdb proxy to ensure Firebase Admin is initialised before calling getAdminAuth()
    void (fdb as unknown as { _dummy?: unknown })._dummy;
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.phone_number ?? null;
  } catch {
    return null;
  }
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
// Accepts a Firebase Phone Auth ID token (phone already verified by Firebase)
// plus the password the user wants to set.
router.post("/auth/register", async (req, res) => {
  const { firebaseToken, password } = req.body as {
    firebaseToken?: string;
    password?: string;
  };

  if (!firebaseToken?.trim() || !password?.trim()) {
    res.status(400).json({ success: false, message: "Firebase token and password are required." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }

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
    passwordHash,
    salt,
    isVerified: true,
    isFirstLogin: true,
    pendingOtp: "",
    otpExpiry: null,
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

  if (!phone?.trim() || !password?.trim()) {
    res.status(400).json({ success: false, message: "Phone and password are required." });
    return;
  }

  const normalised = phone.trim().replace(/\s+/g, "");
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
  if (token) {
    await sessionsCol.deleteByToken(token);
  }
  res.json({ success: true });
});

// ─── POST /auth/forgot-password ───────────────────────────────────────────────
// No longer sends an OTP — Firebase handles that on the frontend.
// This endpoint just confirms the phone exists.
router.post("/auth/forgot-password", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone?.trim()) {
    res.status(400).json({ success: false, message: "Phone number is required." });
    return;
  }
  const normalised = phone.trim().replace(/\s+/g, "");
  const customer = await customersCol.findByPhone(normalised);
  if (!customer || !customer.isVerified) {
    res.status(404).json({ success: false, message: "No verified account found for this phone." });
    return;
  }
  res.json({ success: true, message: "Phone verified. Proceed with OTP." });
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
// Accepts a Firebase Phone Auth ID token (OTP already verified by Firebase)
// plus the new password.
router.post("/auth/reset-password", async (req, res) => {
  const { firebaseToken, newPassword } = req.body as {
    firebaseToken?: string;
    newPassword?: string;
  };
  if (!firebaseToken?.trim() || !newPassword?.trim()) {
    res.status(400).json({ success: false, message: "Firebase token and new password are required." });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }

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

export default router;
