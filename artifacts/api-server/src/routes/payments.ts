import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payments/create-order — create a Razorpay order
router.post("/payments/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body as {
    amount: number;
    currency?: string;
    receipt?: string;
  };

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, message: "Invalid amount." });
    return;
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || "KO-" + randomUUID().slice(0, 8).toUpperCase(),
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ success: false, message: "Failed to create payment order." });
  }
});

// POST /api/payments/verify — verify payment signature after success
router.post("/payments/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ success: false, message: "Missing payment fields." });
    return;
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ success: false, message: "Payment verification failed." });
    return;
  }

  res.json({ success: true, paymentId: razorpay_payment_id });
});

export default router;
