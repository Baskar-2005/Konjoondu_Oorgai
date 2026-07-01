import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { ordersCol, issuesCol, customersCol, notificationsCol } from "../lib/firestoreDb";
import { getCustomerFromToken } from "./auth";

const router: IRouter = Router();

const VALID_STATUSES = [
  "pending", "confirmed", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled", "returned", "refunded",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_INFO: Record<string, { label: string; description: string }> = {
  pending:          { label: "Order Placed",      description: "Your order has been placed and is awaiting confirmation." },
  confirmed:        { label: "Order Confirmed",   description: "Your order has been confirmed and will be packed soon." },
  packed:           { label: "Order Packed",      description: "Your order has been packed and is ready for dispatch." },
  shipped:          { label: "Order Shipped",     description: "Your order is on its way!" },
  out_for_delivery: { label: "Out for Delivery",  description: "Your order is out for delivery. Expect it today!" },
  delivered:        { label: "Order Delivered",   description: "Your order has been delivered. Enjoy your pickles!" },
  cancelled:        { label: "Order Cancelled",   description: "Your order has been cancelled." },
  returned:         { label: "Return Initiated",  description: "Your return request has been initiated." },
  refunded:         { label: "Refunded",          description: "Your refund has been processed." },
};

function requireAdmin(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return false;
  }
  return true;
}

async function formatOrder(order: Awaited<ReturnType<typeof ordersCol.findById>>) {
  if (!order) return null;
  const items = await ordersCol.getItems(order.id);
  return {
    id: order.id,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail || "",
      address: order.shippingAddress,
    },
    items: items.map((i) => ({
      productId: Number(i.productId) || 0,
      productName: i.name,
      size: i.size,
      price: i.price,
      quantity: i.quantity,
    })),
    totalAmount: order.totalAmount,
    paymentId: order.razorpayPaymentId || undefined,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    courierName: order.courierName || undefined,
    trackingId: order.trackingId || undefined,
    estimatedDelivery: order.estimatedDelivery || undefined,
  };
}

async function addTrackingStep(orderId: string, status: string) {
  const info = STATUS_INFO[status] ?? { label: status, description: `Status updated to ${status}.` };
  await ordersCol.addTracking(orderId, {
    status,
    label: info.label,
    description: info.description,
    completed: true,
  });
}

async function sendConfirmationEmail(
  order: NonNullable<Awaited<ReturnType<typeof formatOrder>>>,
): Promise<void> {
  if (!order.customer.email) return;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
  });

  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;">${i.productName} (${i.size})</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:right;">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:Poppins,Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,94,60,0.1);">
    <div style="background:linear-gradient(135deg,#b53a2e,#8b2a20);padding:32px 36px;text-align:center;">
      <h1 style="color:#fff9f0;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Konjoondu Oorgai</h1>
      <p style="color:rgba(255,249,240,0.75);margin:6px 0 0;font-size:14px;">Order Confirmation</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#3d2b1f;font-size:16px;margin-top:0;">Dear <strong>${order.customer.name}</strong>,</p>
      <p style="color:#6b4c38;font-size:14px;line-height:1.6;">
        Thank you for your order! We've received it and will contact you within 24 hours to arrange delivery.
      </p>
      <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin:20px 0;border:1px solid #f0e8df;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Order ID</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#b53a2e;">${order.id}</p>
        ${order.paymentId ? `<p style="margin:4px 0 0;font-size:12px;color:#6b4c38;">✅ Paid · ${order.paymentId}</p>` : `<p style="margin:4px 0 0;font-size:12px;color:#b45309;">⏳ Payment pending</p>`}
      </div>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="background:#fdf8f3;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;font-weight:800;font-size:15px;color:#3d2b1f;">Total</td>
            <td style="padding:12px;font-weight:800;font-size:18px;color:#b53a2e;text-align:right;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin:20px 0;border:1px solid #f0e8df;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Delivery Address</p>
        <p style="margin:6px 0 0;font-size:14px;color:#3d2b1f;line-height:1.5;">${order.customer.address}</p>
      </div>
      <p style="color:#6b4c38;font-size:13px;line-height:1.6;">
        We'll send you an update once your order is shipped. If you have any questions, just reply to this email.
      </p>
    </div>
    <div style="background:#fdf8f3;padding:20px 36px;text-align:center;border-top:1px solid #f0e8df;">
      <p style="margin:0;font-size:12px;color:#8b5e3c;">© ${new Date().getFullYear()} Konjoondu Oorgai · Handcrafted Pickles</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Konjoondu Oorgai" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmed — ${order.id} | Konjoondu Oorgai`,
      html,
    });
    console.info("[email] Confirmation sent for order", order.id);
  } catch (err) {
    console.warn("[email] Failed to send confirmation:", err);
  }
}

async function notifyTelegram(
  order: NonNullable<Awaited<ReturnType<typeof formatOrder>>>,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const itemLines = order.items
    .map((i) => `  • ${i.productName} (${i.size}) ×${i.quantity} = ₹${i.price * i.quantity}`)
    .join("\n");

  const text = [
    `🛒 *New Order — ${order.id}*`, ``,
    `👤 ${order.customer.name}`,
    `📞 ${order.customer.phone}`,
    order.customer.email ? `📧 ${order.customer.email}` : null,
    `📍 ${order.customer.address}`, ``,
    `*Items:*`, itemLines, ``,
    `💰 *Total: ₹${order.totalAmount.toLocaleString("en-IN")}*`,
    order.paymentId ? `✅ Paid · ${order.paymentId}` : `⏳ Payment pending`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const data = (await r.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.warn("[telegram] API error:", data.description);
    else console.info("[telegram] Notification sent for order", order.id);
  } catch (err) {
    console.warn("[telegram] Failed to send notification:", err);
  }
}

// POST /api/orders
router.post("/orders", async (req, res) => {
  const { customer, items, totalAmount, paymentId } = req.body as {
    customer: { name: string; phone: string; email?: string; address: string };
    items: Array<{ productId: number; productName: string; size: string; price: number; quantity: number }>;
    totalAmount: number;
    paymentId?: string;
  };

  if (!customer?.name || !customer?.phone || !customer?.address || !items?.length) {
    res.status(400).json({ success: false, message: "Missing required fields." });
    return;
  }

  const id = "KO-" + randomUUID().slice(0, 8).toUpperCase();
  const status = paymentId ? "confirmed" : "pending";

  const order = await ordersCol.create({
    id,
    razorpayOrderId: null,
    razorpayPaymentId: paymentId || null,
    customerName: customer.name,
    customerEmail: customer.email || "",
    customerEmailLower: (customer.email || "").toLowerCase(),
    customerPhone: customer.phone,
    shippingAddress: customer.address,
    totalAmount,
    status,
    courierName: null,
    trackingId: null,
    estimatedDelivery: null,
  });

  await ordersCol.addItems(
    id,
    items.map((i) => ({
      productId: String(i.productId),
      name: i.productName,
      size: i.size,
      price: i.price,
      quantity: i.quantity,
    })),
  );

  await addTrackingStep(id, "pending");
  if (status === "confirmed") await addTrackingStep(id, "confirmed");

  const formatted = await formatOrder(order);

  res.status(201).json({
    success: true,
    orderId: id,
    message: "Order placed successfully.",
    order: formatted,
  });

  if (formatted) {
    notifyTelegram(formatted);
    sendConfirmationEmail(formatted);
  }
});

// GET /api/orders
router.get("/orders", async (req, res) => {
  const { customer_email, customer_phone } = req.query as {
    customer_email?: string;
    customer_phone?: string;
  };

  if (customer_email || customer_phone) {
    const [byEmail, byPhone] = await Promise.all([
      customer_email ? ordersCol.findByEmail(customer_email) : Promise.resolve([]),
      customer_phone ? ordersCol.findByPhone(customer_phone) : Promise.resolve([]),
    ]);
    const seen = new Set<string>();
    const merged = [...byEmail, ...byPhone].filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
    merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const orders = await Promise.all(merged.map(formatOrder));
    res.json({ success: true, orders, total: orders.length });
    return;
  }

  if (!requireAdmin(req, res)) return;
  const rows = await ordersCol.findAll();
  const allOrders = await Promise.all(rows.map(formatOrder));
  res.json({ success: true, orders: allOrders, total: allOrders.length });
});

// GET /api/orders/:id
router.get("/orders/:id", async (req, res) => {
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }
  res.json({ success: true, order: await formatOrder(order) });
});

// GET /api/orders/:id/tracking
router.get("/orders/:id/tracking", async (req, res) => {
  const steps = await ordersCol.getTracking(req.params.id);
  res.json({
    success: true,
    steps: steps.map((s) => ({
      id: s.id,
      status: s.status,
      label: s.label,
      description: s.description,
      timestamp: s.timestamp.toISOString(),
      completed: s.completed,
    })),
  });
});

// PATCH /api/orders/:id/status (admin)
router.patch("/orders/:id/status", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { status } = req.body as { status: string };
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ success: false, message: "Invalid status." });
    return;
  }
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }
  await ordersCol.update(req.params.id, { status });
  await addTrackingStep(req.params.id, status);
  // Notify the customer about the status change
  const info = STATUS_INFO[status] ?? { label: status, description: `Your order status has been updated to ${status}.` };
  const customer = await customersCol.findByPhone(order.customerPhone);
  if (customer) {
    await notificationsCol.create({
      customerId: customer.id,
      type: "order_update",
      title: info.label,
      body: `Order ${order.id}: ${info.description}`,
      metadata: { orderId: order.id, status },
    }).catch(() => {}); // non-blocking, don't fail the request
  }
  const updated = await ordersCol.findById(req.params.id);
  res.json({ success: true, order: await formatOrder(updated) });
});

// PATCH /api/orders/:id/shipment (admin)
router.patch("/orders/:id/shipment", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { courierName, trackingId, estimatedDelivery } = req.body as {
    courierName?: string; trackingId?: string; estimatedDelivery?: string;
  };
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }
  await ordersCol.update(req.params.id, {
    courierName: courierName || null,
    trackingId: trackingId || null,
    estimatedDelivery: estimatedDelivery || null,
  });
  const updated = await ordersCol.findById(req.params.id);
  res.json({ success: true, order: await formatOrder(updated) });
});

// POST /api/orders/:id/issues
router.post("/orders/:id/issues", async (req, res) => {
  const customerId = await getCustomerFromToken(req, res);
  if (!customerId) return;
  const { type, description } = req.body as { type: string; description: string };
  if (!type || !description) {
    res.status(400).json({ success: false, message: "type and description are required." });
    return;
  }
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }
  const customer = await customersCol.findById(customerId);
  if (!customer || order.customerPhone !== customer.phone) {
    res.status(403).json({ success: false, message: "You do not own this order." });
    return;
  }
  const issue = await issuesCol.create(req.params.id, { type, description });
  res.status(201).json({ success: true, issue });
});

// GET /api/issues (admin)
router.get("/issues", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const issues = await issuesCol.findAll();
  res.json({ success: true, issues, total: issues.length });
});

// PATCH /api/issues/:id (admin)
router.patch("/issues/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { adminReply, status } = req.body as { adminReply?: string; status?: string };
  const existing = await issuesCol.findById(req.params.id);
  if (!existing) { res.status(404).json({ success: false, message: "Issue not found." }); return; }
  const updates: { adminReply?: string; status?: string } = {};
  if (adminReply !== undefined) updates.adminReply = adminReply;
  if (status !== undefined) updates.status = status;
  const updated = await issuesCol.update(req.params.id, updates);
  res.json({ success: true, issue: updated });
});

export default router;
