import { Router, type IRouter, type Request, type Response } from "express";
import { customersCol, ordersCol, reviewsCol, inventoryCol } from "../lib/firestoreDb";
import { sanitizeString, LIMITS } from "../lib/validate";

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
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch customers." });
  }
});

// GET /api/admin/reviews — all reviews across all customers
router.get("/admin/reviews", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const reviews = await reviewsCol.findAllAdmin();
    const customerIds = [...new Set(reviews.map((r) => r.customerId).filter(Boolean))];
    const customerDocs = await Promise.all(customerIds.map((id) => customersCol.findById(id)));
    const nameMap = new Map<string, string>();
    for (let i = 0; i < customerIds.length; i++) {
      const doc = customerDocs[i];
      if (doc) nameMap.set(customerIds[i], doc.name);
    }
    const result = reviews.map((r) => ({ ...r, customerName: nameMap.get(r.customerId) ?? "Unknown" }));
    res.json({ success: true, reviews: result, total: result.length });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
});

// PATCH /api/admin/reviews/:customerId/:reviewId — approve/reject/reply
router.patch("/admin/reviews/:customerId/:reviewId", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { customerId, reviewId } = req.params;
  const { status, adminReply } = req.body as { status?: string; adminReply?: string };
  const updates: { status?: string; adminReply?: string } = {};
  const ALLOWED_STATUSES = ["pending", "approved", "rejected"];
  if (status) {
    if (!ALLOWED_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status." }); return;
    }
    updates.status = status;
  }
  if (adminReply !== undefined) updates.adminReply = sanitizeString(adminReply, 1000);
  if (!Object.keys(updates).length) {
    res.status(400).json({ success: false, message: "Nothing to update." }); return;
  }
  try {
    await reviewsCol.adminUpdate(customerId, reviewId, updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update review." });
  }
});

// GET /api/admin/inventory — all inventory items
router.get("/admin/inventory", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const inventory = await inventoryCol.findAll();
    res.json({ success: true, inventory });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch inventory." });
  }
});

// POST /api/admin/inventory — add a new inventory item
router.post("/admin/inventory", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const body = req.body as Record<string, unknown>;
    const item = {
      productName: sanitizeString(body.productName, LIMITS.PRODUCT_NAME),
      sku: sanitizeString(body.sku, 50),
      size: sanitizeString(body.size, 50),
      batch: sanitizeString(body.batch, 100),
      stock: Math.max(0, Math.round(Number(body.stock ?? 0))),
      threshold: Math.max(0, Math.round(Number(body.threshold ?? 10))),
      incoming: Math.max(0, Math.round(Number(body.incoming ?? 0))),
      expiry: sanitizeString(body.expiry, 20),
      supplier: sanitizeString(body.supplier, 200),
      cost: Math.max(0, Number(body.cost ?? 0)),
    };
    if (!item.productName) {
      res.status(400).json({ success: false, message: "productName is required." }); return;
    }
    const id = await inventoryCol.create(item);
    res.json({ success: true, id });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create inventory item." });
  }
});

// PATCH /api/admin/inventory/:id — update any inventory fields
router.patch("/admin/inventory/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  try {
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    const numFields = ["stock", "threshold", "incoming", "cost"];
    const strFields = ["productName", "sku", "size", "batch", "expiry", "supplier"];
    for (const f of numFields) if (f in body) updates[f] = Math.max(0, Number(body[f]));
    for (const f of strFields) if (f in body) updates[f] = sanitizeString(body[f], 200);
    if (!Object.keys(updates).length) {
      res.status(400).json({ success: false, message: "Nothing to update." }); return;
    }
    await inventoryCol.update(id, updates as Parameters<typeof inventoryCol.update>[1]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update inventory." });
  }
});

// POST /api/admin/inventory/sync — upsert all canonical SKUs
router.post("/admin/inventory/sync", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const result = await inventoryCol.syncAll();
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ success: false, message: "Failed to sync inventory." });
  }
});

// DELETE /api/admin/inventory/:id — remove an inventory item
router.delete("/admin/inventory/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;
  try {
    await inventoryCol.delete(id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete inventory item." });
  }
});

// GET /products/stock — public endpoint: returns stock levels per product/size
router.get("/products/stock", async (req, res) => {
  try {
    const inventory = await inventoryCol.findAll();
    const stock = inventory.map((i) => ({
      productName: i.productName,
      size: i.size || i.sku.replace(/^P\d+-/, ""),
      stock: i.stock,
    }));
    res.json({ success: true, stock });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch stock." });
  }
});

export default router;
