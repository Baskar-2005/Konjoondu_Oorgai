import { Router, type IRouter, type Request, type Response } from "express";
import { customersCol, ordersCol, reviewsCol, inventoryCol } from "../lib/firestoreDb";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return false;
  }
  return true;
}

// GET /api/admin/customers — all registered customers with order stats
router.get("/admin/customers", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [customers, orders] = await Promise.all([
      customersCol.findAll(),
      ordersCol.findAll(),
    ]);

    // Build per-phone order stats from orders
    const statsMap = new Map<string, { orders: number; lifetime: number; lastOrder: Date | null }>();
    for (const o of orders) {
      const phone = o.customerPhone;
      const existing = statsMap.get(phone) ?? { orders: 0, lifetime: 0, lastOrder: null };
      existing.orders += 1;
      existing.lifetime += o.totalAmount;
      const oDate = new Date(o.createdAt);
      if (!existing.lastOrder || oDate > existing.lastOrder) existing.lastOrder = oDate;
      statsMap.set(phone, existing);
    }

    const result = customers.map((c) => {
      const stats = statsMap.get(c.phone) ?? { orders: 0, lifetime: 0, lastOrder: null };
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        isVerified: c.isVerified,
        rewardPoints: c.rewardPoints,
        createdAt: c.createdAt,
        orderCount: stats.orders,
        lifetimeValue: stats.lifetime,
        lastOrderAt: stats.lastOrder,
      };
    });

    res.json({ success: true, customers: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
});

// GET /api/admin/reviews — all reviews across all customers
router.get("/admin/reviews", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const reviews = await reviewsCol.findAllAdmin();

    // Collect unique customerIds and fetch names in one batch
    const customerIds = [...new Set(reviews.map((r) => r.customerId).filter(Boolean))];
    const customerDocs = await Promise.all(customerIds.map((id) => customersCol.findById(id)));
    const nameMap = new Map<string, string>();
    for (let i = 0; i < customerIds.length; i++) {
      const doc = customerDocs[i];
      if (doc) nameMap.set(customerIds[i], doc.name);
    }

    const result = reviews.map((r) => ({
      ...r,
      customerName: nameMap.get(r.customerId) ?? "Unknown",
    }));

    res.json({ success: true, reviews: result, total: result.length });
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
});

// PATCH /api/admin/reviews/:customerId/:reviewId — approve/reject/reply
router.patch("/admin/reviews/:customerId/:reviewId", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { customerId, reviewId } = req.params;
  const { status, adminReply } = req.body as { status?: string; adminReply?: string };
  const updates: { status?: string; adminReply?: string } = {};
  if (status) updates.status = status;
  if (adminReply !== undefined) updates.adminReply = adminReply;
  if (!Object.keys(updates).length) {
    res.status(400).json({ success: false, message: "Nothing to update." });
    return;
  }
  try {
    await reviewsCol.adminUpdate(customerId, reviewId, updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
});

// GET /api/admin/inventory — all inventory items (auto-seeds if empty)
router.get("/admin/inventory", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const inventory = await inventoryCol.findAll();
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
});

// PATCH /api/admin/inventory/:id — update stock count
router.patch("/admin/inventory/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  const { stock } = req.body as { stock?: number };
  if (stock === undefined || typeof stock !== "number" || stock < 0) {
    res.status(400).json({ success: false, message: "stock must be a non-negative number." });
    return;
  }
  try {
    await inventoryCol.update(id, stock);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: String(err) });
  }
});

export default router;
