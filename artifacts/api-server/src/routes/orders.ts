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
  status: "pending" | "confirmed";
  createdAt: string;
}

// In-memory store until Razorpay / DB integration
const orders = new Map<string, Order>();

// POST /api/orders — place a new order
router.post("/orders", (req, res) => {
  const { customer, items, totalAmount } = req.body as {
    customer: Order["customer"];
    items: OrderItem[];
    totalAmount: number;
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
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.set(id, order);

  res.status(201).json({
    success: true,
    orderId: id,
    message: "Order received! We'll contact you within 24 hours to confirm.",
    order,
  });
});

// GET /api/orders/:id — restricted to admin-token header only
router.get("/orders/:id", (req, res) => {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return;
  }
  const order = orders.get(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }
  res.json({ success: true, order });
});

export default router;
