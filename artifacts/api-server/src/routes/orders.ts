import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";

const router: IRouter = Router();

interface OrderItem {
  productId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentId?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

// In-memory store
const orders = new Map<string, Order>();

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return false;
  }
  return true;
}

// Send Telegram notification (fire-and-forget)
async function notifyTelegram(order: Order): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const itemLines = order.items
    .map(i => `  • ${i.productName} (${i.size}) ×${i.quantity} = ₹${i.price * i.quantity}`)
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
  ].filter(l => l !== null).join("\n");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.warn("[telegram] API error:", data.description);
    } else {
      console.info("[telegram] Notification sent for order", order.id);
    }
  } catch (err) {
    console.warn("[telegram] Failed to send notification:", err);
  }
}

// POST /api/orders — place a new order (after Razorpay payment)
router.post("/orders", async (req, res) => {
  const { customer, items, totalAmount, paymentId } = req.body as {
    customer: Order["customer"];
    items: OrderItem[];
    totalAmount: number;
    paymentId?: string;
  };

  if (!customer?.name || !customer?.phone || !items?.length) {
    res.status(400).json({ success: false, message: "Missing required fields." });
    return;
  }

  const id = "KO-" + randomUUID().slice(0, 8).toUpperCase();
  const order: Order = {
    id,
    customer,
    items,
    totalAmount,
    paymentId,
    status: paymentId ? "confirmed" : "pending",
    createdAt: new Date().toISOString(),
  };

  orders.set(id, order);

  // Respond immediately, notify in background
  res.status(201).json({
    success: true,
    orderId: id,
    message: "Order placed successfully.",
    order,
  });

  notifyTelegram(order); // fire-and-forget — never blocks the response
});

// GET /api/orders — list all orders (admin only)
router.get("/orders", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const allOrders = Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, orders: allOrders, total: allOrders.length });
});

// GET /api/orders/:id — single order (admin only)
router.get("/orders/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }
  res.json({ success: true, order });
});

// PATCH /api/orders/:id/status — update order status (admin only)
router.patch("/orders/:id/status", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }
  const { status } = req.body as { status: Order["status"] };
  const valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    res.status(400).json({ success: false, message: "Invalid status." });
    return;
  }
  order.status = status;
  orders.set(order.id, order);
  res.json({ success: true, order });
});

export default router;
