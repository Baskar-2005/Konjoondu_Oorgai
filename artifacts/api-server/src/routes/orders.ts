import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { ordersCol, issuesCol, customersCol, notificationsCol, inventoryCol } from "../lib/firestoreDb";
import { getCustomerFromToken } from "./auth";
import { getMonitorConfig, setMonitorThreshold, getAlertLog } from "../lib/bottleneckMonitor";

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

function getStationFromToken(token: string): { station: string; targetStatus: string; label: string } | null {
  const map: Record<string, { station: string; targetStatus: string; label: string }> = {};
  if (process.env.PACKING_STATION_TOKEN)  map[process.env.PACKING_STATION_TOKEN]  = { station: "packing",  targetStatus: "packed",    label: "Packing Station"  };
  if (process.env.SHIPPING_STATION_TOKEN) map[process.env.SHIPPING_STATION_TOKEN] = { station: "shipping", targetStatus: "shipped",   label: "Shipping Station" };
  if (process.env.DELIVERY_STATION_TOKEN) map[process.env.DELIVERY_STATION_TOKEN] = { station: "delivery", targetStatus: "delivered", label: "Delivery Station" };
  return map[token] ?? null;
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
    courierPartner: order.courierName || undefined,
    trackingId: order.trackingId || undefined,
    trackingNumber: order.trackingId || undefined,
    trackingAvailable: order.trackingAvailable ?? false,
    shippedAt: order.shippedAt?.toISOString() || undefined,
    estimatedDelivery: order.estimatedDelivery || undefined,
    isGift: order.isGift ?? false,
    giftSenderName: order.giftSenderName || undefined,
    giftSenderPhone: order.giftSenderPhone || undefined,
    giftSenderEmail: order.giftSenderEmail || undefined,
    giftMessage: order.giftMessage || undefined,
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

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const itemLines = order.items
    .map((i) => `  • ${esc(i.productName)} (${esc(i.size)}) ×${i.quantity} = ₹${i.price * i.quantity}`)
    .join("\n");

  const text = [
    `🛒 <b>New Order — ${esc(order.id)}</b>`, ``,
    `👤 ${esc(order.customer.name)}`,
    `📞 ${esc(order.customer.phone)}`,
    order.customer.email ? `📧 ${esc(order.customer.email)}` : null,
    `📍 ${esc(order.customer.address)}`, ``,
    `<b>Items:</b>`, itemLines, ``,
    `💰 <b>Total: ₹${order.totalAmount.toLocaleString("en-IN")}</b>`,
    order.paymentId ? `✅ Paid · ${esc(order.paymentId)}` : `⏳ Payment pending`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = (await r.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.warn("[telegram] API error:", data.description);
    else console.info("[telegram] Notification sent for order", order.id);
  } catch (err) {
    console.warn("[telegram] Failed to send notification:", err);
  }
}

// Deduct inventory stock for each confirmed order item
async function deductInventoryForOrder(
  items: Array<{ productName: string; size: string; quantity: number }>,
) {
  try {
    const inventory = await inventoryCol.findAll();
    for (const item of items) {
      const match = inventory.find((inv) => {
        const nameMatch =
          inv.productName.toLowerCase().includes(item.productName.toLowerCase()) ||
          item.productName.toLowerCase().includes(inv.productName.toLowerCase());
        // size field is often empty — fall back to extracting from SKU (e.g. "P4-250g" → "250g")
        const effectiveSize = inv.size || inv.sku.replace(/^P\d+-/, "");
        return nameMatch && effectiveSize === item.size;
      });
      if (match) {
        const newStock = Math.max(0, match.stock - item.quantity);
        await inventoryCol.update(match.id, { stock: newStock });
      }
    }
  } catch (err) {
    console.error("[inventory] Failed to deduct stock after order:", err);
  }
}

async function sendShipmentEmail(
  order: NonNullable<Awaited<ReturnType<typeof formatOrder>>>,
  courierPartner: string,
  trackingNumber: string,
): Promise<void> {
  if (!order.customer.email) return;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
  });

  const COURIER_URLS: Record<string, string> = {
    DTDC:        "https://www.dtdc.in/tracking/tracking_results.asp?podNo=",
    Delhivery:   "https://www.delhivery.com/track/package/",
    "Blue Dart": "https://www.bluedart.com/tracking?trackFor=0&awbNo=",
    "India Post": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?tracking=",
    XpressBees:  "https://www.xpressbees.com/track?awbNo=",
  };
  const trackUrl = COURIER_URLS[courierPartner]
    ? `${COURIER_URLS[courierPartner]}${trackingNumber}`
    : undefined;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:Poppins,Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,94,60,0.1);">
    <div style="background:linear-gradient(135deg,#b53a2e,#8b2a20);padding:32px 36px;text-align:center;">
      <h1 style="color:#fff9f0;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Konjoondu Oorgai</h1>
      <p style="color:rgba(255,249,240,0.75);margin:6px 0 0;font-size:14px;">🚚 Your Order Has Been Shipped!</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#3d2b1f;font-size:16px;margin-top:0;">Dear <strong>${order.customer.name}</strong>,</p>
      <p style="color:#6b4c38;font-size:14px;line-height:1.6;">
        Great news! Your order has been shipped and is on its way to you.
      </p>
      <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin:20px 0;border:1px solid #f0e8df;">
        <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Order ID</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#b53a2e;">${order.id}</p>
      </div>
      <div style="background:#fff7ed;border-radius:12px;padding:20px;margin:20px 0;border:2px solid #fed7aa;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#92400e;">Shipment Details</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#78350f;">Courier Partner</span>
          <span style="font-size:13px;font-weight:700;color:#1c1917;">${courierPartner}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#78350f;">Tracking Number</span>
          <span style="font-size:15px;font-weight:800;color:#b53a2e;font-family:monospace;">${trackingNumber}</span>
        </div>
        ${trackUrl ? `<a href="${trackUrl}" style="display:block;text-align:center;padding:12px;background:#b53a2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Track on ${courierPartner} Website →</a>` : ""}
      </div>
      <p style="color:#6b4c38;font-size:13px;line-height:1.6;">
        Use the tracking number above to monitor your shipment on the ${courierPartner} website. If you have any questions, just reply to this email.
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
      subject: `Your Order Has Been Shipped — ${order.id} | Konjoondu Oorgai`,
      html,
    });
    console.info("[email] Shipment notification sent for order", order.id);
  } catch (err) {
    console.warn("[email] Failed to send shipment notification:", err);
  }
}

async function notifyTelegramShipment(
  order: NonNullable<Awaited<ReturnType<typeof formatOrder>>>,
  courierPartner: string,
  trackingNumber: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const text = [
    `🚚 <b>Order Shipped — ${esc(order.id)}</b>`, ``,
    `👤 ${esc(order.customer.name)}`,
    `📞 ${esc(order.customer.phone)}`,
    `📦 Courier: <b>${esc(courierPartner)}</b>`,
    `🔢 Tracking: <code>${esc(trackingNumber)}</code>`,
  ].join("\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = (await r.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.warn("[telegram] Shipment notify error:", data.description);
  } catch (err) {
    console.warn("[telegram] Failed to send shipment notification:", err);
  }
}

// POST /api/orders
router.post("/orders", async (req, res) => {
  const { customer, items, totalAmount, paymentId, isGift, giftSender, giftMessage } = req.body as {
    customer: { name: string; phone: string; email?: string; address: string };
    items: Array<{ productId: number; productName: string; size: string; price: number; quantity: number }>;
    totalAmount: number;
    paymentId?: string;
    isGift?: boolean;
    giftSender?: { name: string; phone: string; email?: string };
    giftMessage?: string;
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
    isGift: isGift ?? false,
    giftSenderName: giftSender?.name || null,
    giftSenderPhone: giftSender?.phone || null,
    giftSenderEmail: giftSender?.email || null,
    giftMessage: giftMessage || null,
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
  if (status === "confirmed") {
    await addTrackingStep(id, "confirmed");
    // Deduct inventory stock now that payment is confirmed
    await deductInventoryForOrder(
      items.map((i) => ({ productName: i.productName, size: i.size, quantity: i.quantity })),
    );
  }

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

// GET /api/station/manager/config — get bottleneck threshold (admin only)
router.get("/station/manager/config", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ success: true, ...getMonitorConfig() });
});

// PATCH /api/station/manager/config — update bottleneck threshold at runtime (admin only)
router.patch("/station/manager/config", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { threshold } = req.body as { threshold?: number };
  if (typeof threshold !== "number" || threshold < 1 || threshold > 999) {
    res.status(400).json({ success: false, message: "threshold must be a number 1–999" });
    return;
  }
  setMonitorThreshold(threshold);
  res.json({ success: true, threshold });
});

// GET /api/station/manager/alerts — recent alert log (admin only)
router.get("/station/manager/alerts", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ success: true, alerts: getAlertLog() });
});

// GET /api/station/manager/stats — all three stations at once (admin only)
router.get("/station/manager/stats", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const STATIONS: Array<{ key: string; label: string; targetStatus: string; waitingStatuses: string[] }> = [
    { key: 'packing',  label: 'Packing Station',  targetStatus: 'packed',    waitingStatuses: ['confirmed','preparing'] },
    { key: 'shipping', label: 'Shipping Station', targetStatus: 'shipped',   waitingStatuses: ['packed','ready_for_pickup','picked_up'] },
    { key: 'delivery', label: 'Delivery Station', targetStatus: 'delivered', waitingStatuses: ['shipped','in_transit','out_for_delivery'] },
  ];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const allOrders = await ordersCol.findAll();

  const stations = STATIONS.map(s => ({
    key: s.key,
    label: s.label,
    targetStatus: s.targetStatus,
    waitingCount: allOrders.filter(o => s.waitingStatuses.includes(o.status)).length,
    doneCount:    allOrders.filter(o => o.status === s.targetStatus).length,
    todayCount:   allOrders.filter(o => o.status === s.targetStatus && o.createdAt >= todayStart).length,
  }));

  res.json({ success: true, stations, timestamp: new Date().toISOString() });
});

// POST /api/station/auth — validate a station token
router.post("/station/auth", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) { res.status(400).json({ success: false, message: "Token required." }); return; }
  const info = getStationFromToken(token);
  if (!info) { res.status(403).json({ success: false, message: "Invalid station token." }); return; }
  res.json({ success: true, station: info.station, label: info.label, targetStatus: info.targetStatus });
});

// GET /api/station/stats — live counts for a station (polls every N seconds)
router.get("/station/stats", async (req, res) => {
  const stationToken = req.headers["x-station-token"] as string | undefined;
  if (!stationToken) { res.status(403).json({ success: false, message: "Forbidden." }); return; }
  const stationInfo = getStationFromToken(stationToken);
  if (!stationInfo) { res.status(403).json({ success: false, message: "Forbidden." }); return; }

  const WAITING_STATUSES: Record<string, string[]> = {
    packing:  ["confirmed", "preparing"],
    shipping: ["packed", "ready_for_pickup", "picked_up"],
    delivery: ["shipped", "in_transit", "out_for_delivery"],
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const allOrders = await ordersCol.findAll();

  const waitingStatuses = WAITING_STATUSES[stationInfo.station] ?? [];
  const waitingCount = allOrders.filter(o => waitingStatuses.includes(o.status)).length;
  const doneCount    = allOrders.filter(o => o.status === stationInfo.targetStatus).length;
  const todayCount   = allOrders.filter(o =>
    o.status === stationInfo.targetStatus && o.createdAt >= todayStart
  ).length;

  res.json({
    success: true,
    station: stationInfo.station,
    targetStatus: stationInfo.targetStatus,
    waitingCount,
    doneCount,
    todayCount,
    timestamp: new Date().toISOString(),
  });
});

// PATCH /api/orders/:id/status (admin or station)
router.patch("/orders/:id/status", async (req, res) => {
  const adminToken   = req.headers["x-admin-token"] as string | undefined;
  const stationToken = req.headers["x-station-token"] as string | undefined;

  let allowedStatus: string | null = null; // null = admin (any status allowed)

  if (adminToken && adminToken === process.env.ADMIN_SECRET) {
    allowedStatus = null;
  } else if (stationToken) {
    const stationInfo = getStationFromToken(stationToken);
    if (!stationInfo) { res.status(403).json({ success: false, message: "Forbidden." }); return; }
    allowedStatus = stationInfo.targetStatus;
  } else {
    res.status(403).json({ success: false, message: "Forbidden." });
    return;
  }

  const { status } = req.body as { status: string };
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ success: false, message: "Invalid status." });
    return;
  }
  if (allowedStatus !== null && status !== allowedStatus) {
    res.status(403).json({ success: false, message: `This station can only set status to "${allowedStatus}".` });
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
      isRead: false,
      metadata: { orderId: order.id, status },
    }).catch(() => {}); // non-blocking, don't fail the request
  }
  const updated = await ordersCol.findById(req.params.id);
  res.json({ success: true, order: await formatOrder(updated) });
});

// PATCH /api/orders/:id/shipment (admin)
router.patch("/orders/:id/shipment", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { courierPartner, trackingNumber } = req.body as {
    courierPartner?: string; trackingNumber?: string;
  };
  if (!courierPartner || !trackingNumber) {
    res.status(400).json({ success: false, message: "courierPartner and trackingNumber are required." });
    return;
  }
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  const shippedAt = new Date();
  await ordersCol.update(req.params.id, {
    courierName: courierPartner,
    trackingId: trackingNumber,
    trackingAvailable: true,
    shippedAt,
    status: "shipped",
  });
  await addTrackingStep(req.params.id, "shipped");

  // In-app notification for customer
  const customer = await customersCol.findByPhone(order.customerPhone);
  if (customer) {
    await notificationsCol.create({
      customerId: customer.id,
      type: "order_update",
      title: "Order Shipped!",
      body: `Order ${order.id} has been shipped via ${courierPartner}. Tracking: ${trackingNumber}`,
      isRead: false,
      metadata: { orderId: order.id, status: "shipped", courierPartner, trackingNumber },
    }).catch(() => {});
  }

  const updated = await ordersCol.findById(req.params.id);
  const formatted = await formatOrder(updated);
  res.json({ success: true, order: formatted });

  // Send email & Telegram notifications (non-blocking)
  if (formatted) {
    sendShipmentEmail(formatted, courierPartner, trackingNumber);
    notifyTelegramShipment(formatted, courierPartner, trackingNumber);
  }
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

// DELETE /api/orders/:id/shipment (admin) — clear tracking details
router.delete("/orders/:id/shipment", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const order = await ordersCol.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  await ordersCol.update(req.params.id, {
    courierName: null,
    trackingId: null,
    trackingAvailable: false,
    shippedAt: null,
  });

  const updated = await ordersCol.findById(req.params.id);
  res.json({ success: true, order: await formatOrder(updated) });
});

// ─── Public order tracking (no auth) ─────────────────────────────────────────
router.get("/track/:orderId", async (req, res) => {
  try {
    const order = await ordersCol.findById(req.params.orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found. Please check the order ID and try again." });
      return;
    }
    const items = await ordersCol.getItems(order.id);
    const info  = STATUS_INFO[order.status] ?? { label: order.status, description: `Status: ${order.status}` };
    res.json({
      success: true,
      order: {
        id:               order.id,
        status:           order.status,
        statusLabel:      info.label,
        statusDescription: info.description,
        customer: {
          name:    order.customerName,
          phone:   order.customerPhone,
          email:   order.customerEmail || undefined,
          address: order.shippingAddress,
        },
        items: items.map(i => ({
          productName: i.name,
          size:        i.size,
          quantity:    i.quantity,
          price:       i.price,
        })),
        totalAmount:      order.totalAmount,
        paymentId:        order.razorpayPaymentId || undefined,
        createdAt:        order.createdAt.toISOString(),
        trackingAvailable: order.trackingAvailable ?? false,
        courierPartner:   order.courierName || undefined,
        trackingNumber:   order.trackingId || undefined,
        shippedAt:        order.shippedAt?.toISOString() || undefined,
      },
    });
  } catch (err) {
    console.error("Track order error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;
