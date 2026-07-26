import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// Maximum single-order amount (₹1,00,000 = 100,000 INR)
const MAX_AMOUNT_INR = 100_000;
const ALLOWED_CURRENCIES = new Set(["INR"]);

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// GET /api/razorpay/key — safely expose public key to frontend
router.get("/razorpay/key", (_req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    res.status(503).json({ success: false, message: "Payment gateway not configured." });
    return;
  }
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payments/create-order — create a Razorpay order
router.post("/payments/create-order", async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    res.status(503).json({ success: false, message: "Payment gateway not configured." });
    return;
  }

  const { amount, currency = "INR", receipt } = req.body as {
    amount: number;
    currency?: string;
    receipt?: string;
  };

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    res.status(400).json({ success: false, message: "Invalid amount." });
    return;
  }
  if (numAmount > MAX_AMOUNT_INR) {
    res.status(400).json({ success: false, message: `Amount exceeds maximum allowed (₹${MAX_AMOUNT_INR.toLocaleString("en-IN")}).` });
    return;
  }

  const safeCurrency = String(currency || "INR").toUpperCase();
  if (!ALLOWED_CURRENCIES.has(safeCurrency)) {
    res.status(400).json({ success: false, message: "Only INR is supported." });
    return;
  }

  // Sanitize receipt to avoid injection
  const safeReceipt = receipt
    ? String(receipt).replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 40)
    : "KO-" + randomUUID().slice(0, 8).toUpperCase();

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(numAmount * 100), // paise
      currency: safeCurrency,
      receipt: safeReceipt,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create payment order." });
  }
});

// POST /api/payments/verify — verify payment signature after success
router.post("/payments/verify", (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    res.status(503).json({ success: false, message: "Payment gateway not configured." });
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ success: false, message: "Missing payment fields." });
    return;
  }

  // Validate format to prevent injection into HMAC input
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    razorpay_order_id.length > 100 ||
    razorpay_payment_id.length > 100 ||
    razorpay_signature.length > 200
  ) {
    res.status(400).json({ success: false, message: "Invalid payment fields." });
    return;
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (expectedSignature.length !== razorpay_signature.length ||
      !expectedSignature.split("").every((c, i) => c === razorpay_signature[i])) {
    res.status(400).json({ success: false, message: "Payment verification failed." });
    return;
  }

  res.json({ success: true, paymentId: razorpay_payment_id });
});

// GET /api/razorpay/order/:orderId — fetch Razorpay order details (admin use)
router.get("/razorpay/order/:orderId", async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    res.status(503).json({ success: false, message: "Payment gateway not configured." });
    return;
  }

  // Validate orderId format to prevent SSRF-style abuse
  const { orderId } = req.params;
  if (!/^order_[a-zA-Z0-9]+$/.test(orderId)) {
    res.status(400).json({ success: false, message: "Invalid order ID format." });
    return;
  }

  try {
    const order = await razorpay.orders.fetch(orderId);
    res.json({ success: true, order });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch order from Razorpay." });
  }
});

export default router;
