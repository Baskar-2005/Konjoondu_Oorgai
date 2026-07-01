import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes, pbkdf2Sync } from "crypto";
import { randomUUID } from "crypto";
import { customersCol, sessionsCol, notificationsCol } from "../lib/firestoreDb";
import type { Customer } from "../lib/firestoreDb";

const router: IRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 12000, 64, "sha512").toString("hex");
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

async function createSession(customerId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
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

// ─── POST /auth/send-otp ──────────────────────────────────────────────────────
router.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone?.trim()) {
    res.status(400).json({ success: false, message: "Phone number is required." });
    return;
  }
  const normalised = phone.trim().replace(/\s+/g, "");
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const existing = await customersCol.findByPhone(normalised);

  if (existing) {
    await customersCol.update(existing.id, { pendingOtp: otp, otpExpiry });
  } else {
    const id = "CUST-" + randomUUID().slice(0, 8).toUpperCase();
    const salt = randomBytes(32).toString("hex");
    await customersCol.create(id, {
      phone: normalised,
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
      pendingOtp: otp,
      otpExpiry,
      communicationPrefs: { email: true, sms: true, whatsapp: true },
    });
  }

  const isDev = process.env.NODE_ENV !== "production";
  res
    .json({ success: true, message: "OTP sent.", ...(isDev ? { otp } : {}), expiresIn: 600 });
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
  const { phone, password, otp } = req.body as {
    phone?: string;
    password?: string;
    otp?: string;
  };

  if (!phone?.trim() || !password?.trim() || !otp?.trim()) {
    res.status(400).json({ success: false, message: "Phone, password and OTP are required." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }

  const normalised = phone.trim().replace(/\s+/g, "");
  const customer = await customersCol.findByPhone(normalised);

  if (!customer) {
    res.status(400).json({ success: false, message: "Please request an OTP first." });
    return;
  }
  if (customer.isVerified && customer.passwordHash) {
    res
      .status(400)
      .json({ success: false, message: "An account with this phone already exists. Please log in." });
    return;
  }
  if (customer.pendingOtp !== otp.trim()) {
    res.status(400).json({ success: false, message: "Incorrect OTP." });
    return;
  }
  if (!customer.otpExpiry || new Date() > customer.otpExpiry) {
    res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    return;
  }

  const passwordHash = hashPassword(password, customer.salt);
  const updated = await customersCol.update(customer.id, {
    passwordHash,
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
router.post("/auth/forgot-password", async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone?.trim()) {
    res.status(400).json({ success: false, message: "Phone number is required." });
    return;
  }
  const normalised = phone.trim().replace(/\s+/g, "");
  const customer = await customersCol.findByPhone(normalised);
  if (!customer || !customer.isVerified) {
    res
      .status(404)
      .json({ success: false, message: "No verified account found for this phone." });
    return;
  }
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await customersCol.update(customer.id, { pendingOtp: otp, otpExpiry });
  const isDev = process.env.NODE_ENV !== "production";
  res
    .json({ success: true, message: "OTP sent.", ...(isDev ? { otp } : {}), expiresIn: 600 });
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
router.post("/auth/reset-password", async (req, res) => {
  const { phone, otp, newPassword } = req.body as {
    phone?: string;
    otp?: string;
    newPassword?: string;
  };
  if (!phone?.trim() || !otp?.trim() || !newPassword?.trim()) {
    res
      .status(400)
      .json({ success: false, message: "Phone, OTP and new password are required." });
    return;
  }
  if (newPassword.length < 6) {
    res
      .status(400)
      .json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }
  const normalised = phone.trim().replace(/\s+/g, "");
  const customer = await customersCol.findByPhone(normalised);
  if (!customer) {
    res.status(404).json({ success: false, message: "Account not found." });
    return;
  }
  if (customer.pendingOtp !== otp.trim()) {
    res.status(400).json({ success: false, message: "Incorrect OTP." });
    return;
  }
  if (!customer.otpExpiry || new Date() > customer.otpExpiry) {
    res.status(400).json({ success: false, message: "OTP has expired." });
    return;
  }
  const passwordHash = hashPassword(newPassword, customer.salt);
  const updated = await customersCol.update(customer.id, {
    passwordHash,
    pendingOtp: "",
    otpExpiry: null,
  });
  await sessionsCol.deleteByCustomerId(customer.id);
  const token = await createSession(customer.id);
  res.json({ success: true, token, customer: safeCustomer(updated) });
});

export default router;
