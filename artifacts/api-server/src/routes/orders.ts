import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import {
  ordersTable,
  orderItemsTable,
  trackingStepsTable,
  issuesTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const VALID_STATUSES = [
  "pending", "confirmed", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled", "returned", "refunded",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_INFO: Record<string, { label: string; description: string }> = {
  pending:           { label: "Order Placed",       description: "Your order has been placed and is awaiting confirmation." },
  confirmed:         { label: "Order Confirmed",    description: "Your order has been confirmed and will be packed soon." },
  packed:            { label: "Order Packed",       description: "Your order has been packed and is ready for dispatch." },
  shipped:           { label: "Order Shipped",      description: "Your order is on its way!" },
  out_for_delivery:  { label: "Out for Delivery",   description: "Your order is out for delivery. Expect it today!" },
  delivered:         { label: "Order Delivered",    description: "Your order has been delivered. Enjoy your pickles!" },
  cancelled:         { label: "Order Cancelled",    description: "Your order has been cancelled." },
  returned:          { label: "Return Initiated",   description: "Your return request has been initiated." },
  refunded:          { label: "Refunded",            description: "Your refund has been processed." },
};

function requireAdmin(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return false;
  }
  return true;
}

async function formatOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

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
  await db.insert(trackingStepsTable).values({
    orderId,
    status,
    label: info.label,
    description: info.description,
    completed: true,
  });
}

async function notifyTelegram(order: Awaited<ReturnType<typeof formatOrder>>): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const itemLines = order.items
    .map((i) => `  • ${i.productName} (${i.size}) ×${i.quantity} = ₹${i.price * i.quantity}`)
    .join("\n");

  const text = [
    `🛒 *New Order — ${order.id}*`,
    ``,
    `👤 ${order.customer.name}`,
    `📞 ${order.customer.phone}`,
    order.customer.email ? `📧 ${order.customer.email}` : null,
    `📍 ${order.customer.address}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `💰 *Total: ₹${order.totalAmount.toLocaleString("en-IN")}*`,
    order.paymentId ? `✅ Paid · ${order.paymentId}` : `⏳ Payment pending`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) {
      console.warn("[telegram] API error:", data.description);
    } else {
      console.info("[telegram] Notification sent for order", order.id);
    }
  } catch (err) {
    console.warn("[telegram] Failed to send notification:", err);
  }
}

// POST /api/orders — place a new order
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

  await db.insert(ordersTable).values({
    id,
    razorpayPaymentId: paymentId || null,
    customerName: customer.name,
    customerEmail: customer.email || "",
    customerPhone: customer.phone,
    shippingAddress: customer.address,
    totalAmount,
    status,
  });

  await db.insert(orderItemsTable).values(
    items.map((i) => ({
      orderId: id,
      productId: String(i.productId),
      name: i.productName,
      size: i.size,
      price: i.price,
      quantity: i.quantity,
    }))
  );

  await addTrackingStep(id, "pending");
  if (status === "confirmed") {
    await addTrackingStep(id, "confirmed");
  }

  const formatted = await formatOrder(
    (await db.select().from(ordersTable).where(eq(ordersTable.id, id)))[0]
  );

  res.status(201).json({
    success: true,
    orderId: id,
    message: "Order placed successfully.",
    order: formatted,
  });

  notifyTelegram(formatted);
});

// GET /api/orders — list all orders (admin only)
router.get("/orders", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  const allOrders = await Promise.all(rows.map(formatOrder));

  res.json({ success: true, orders: allOrders, total: allOrders.length });
});

// GET /api/orders/:id — single order (public for tracking, or admin)
router.get("/orders/:id", async (req, res) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id));

  if (!rows.length) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  const order = await formatOrder(rows[0]);
  res.json({ success: true, order });
});

// GET /api/orders/:id/tracking — tracking steps for an order
router.get("/orders/:id/tracking", async (req, res) => {
  const steps = await db
    .select()
    .from(trackingStepsTable)
    .where(eq(trackingStepsTable.orderId, req.params.id))
    .orderBy(trackingStepsTable.timestamp);

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

// PATCH /api/orders/:id/status — update order status (admin only)
router.patch("/orders/:id/status", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { status } = req.body as { status: string };
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ success: false, message: "Invalid status." });
    return;
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id));

  if (!rows.length) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(ordersTable.id, req.params.id));

  await addTrackingStep(req.params.id, status);

  const order = await formatOrder(
    (await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id)))[0]
  );

  res.json({ success: true, order });
});

// PATCH /api/orders/:id/shipment — update shipment details (admin only)
router.patch("/orders/:id/shipment", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { courierName, trackingId, estimatedDelivery } = req.body as {
    courierName?: string;
    trackingId?: string;
    estimatedDelivery?: string;
  };

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id));

  if (!rows.length) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  await db
    .update(ordersTable)
    .set({
      courierName: courierName || null,
      trackingId: trackingId || null,
      estimatedDelivery: estimatedDelivery || null,
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, req.params.id));

  const order = await formatOrder(
    (await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id)))[0]
  );

  res.json({ success: true, order });
});

// POST /api/orders/:id/issues — raise a customer issue
router.post("/orders/:id/issues", async (req, res) => {
  const { type, description } = req.body as { type: string; description: string };

  if (!type || !description) {
    res.status(400).json({ success: false, message: "type and description are required." });
    return;
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, req.params.id));

  if (!rows.length) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  const [issue] = await db
    .insert(issuesTable)
    .values({ orderId: req.params.id, type, description })
    .returning();

  res.status(201).json({ success: true, issue });
});

// GET /api/issues — list all issues (admin only)
router.get("/issues", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const issues = await db
    .select()
    .from(issuesTable)
    .orderBy(desc(issuesTable.createdAt));

  res.json({ success: true, issues, total: issues.length });
});

// PATCH /api/issues/:id — admin reply / resolve issue
router.patch("/issues/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { adminReply, status } = req.body as { adminReply?: string; status?: string };

  const rows = await db
    .select()
    .from(issuesTable)
    .where(eq(issuesTable.id, Number(req.params.id)));

  if (!rows.length) {
    res.status(404).json({ success: false, message: "Issue not found." });
    return;
  }

  const updates: Partial<typeof issuesTable.$inferInsert> = {};
  if (adminReply !== undefined) updates.adminReply = adminReply;
  if (status !== undefined) updates.status = status;

  const [updated] = await db
    .update(issuesTable)
    .set(updates)
    .where(eq(issuesTable.id, Number(req.params.id)))
    .returning();

  res.json({ success: true, issue: updated });
});

export default router;
