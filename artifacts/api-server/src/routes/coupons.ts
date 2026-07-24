import { Router, type IRouter, type Request, type Response } from "express";
import { couponsCol } from "../lib/firestoreDb";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden." });
    return false;
  }
  return true;
}

// ── GET /admin/coupons ─────────────────────────────────────────────────────────
router.get("/admin/coupons", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const coupons = await couponsCol.findAll();
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /admin/coupons ────────────────────────────────────────────────────────
router.post("/admin/coupons", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { code, type, value, minOrder, maxUses, expiry, active, description, maxDiscount } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: "code, type and value are required." });
    }
    // Check duplicate
    const existing = await couponsCol.findByCode(code);
    if (existing) {
      return res.status(409).json({ success: false, message: "Coupon code already exists." });
    }
    const coupon = await couponsCol.create({
      code: String(code).toUpperCase().trim(),
      type,
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      maxUses: Number(maxUses) || 100,
      used: 0,
      expiry: expiry || "2026-12-31",
      active: active ?? true,
      description: description || "",
      ...(maxDiscount ? { maxDiscount: Number(maxDiscount) } : {}),
    });
    res.json({ success: true, coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /admin/coupons/:id ───────────────────────────────────────────────────
router.patch("/admin/coupons/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = String(updates.code).toUpperCase().trim();
    if (updates.value !== undefined) updates.value = Number(updates.value);
    if (updates.minOrder !== undefined) updates.minOrder = Number(updates.minOrder);
    if (updates.maxUses !== undefined) updates.maxUses = Number(updates.maxUses);
    if (updates.maxDiscount !== undefined) updates.maxDiscount = Number(updates.maxDiscount);
    await couponsCol.update(req.params.id, updates);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /admin/coupons/:id ──────────────────────────────────────────────────
router.delete("/admin/coupons/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await couponsCol.delete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /coupons/validate (public — called from checkout) ─────────────────────
router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body as { code?: string; orderAmount?: number };
    if (!code?.trim()) {
      return res.status(400).json({ success: false, message: "Coupon code required." });
    }
    const coupon = await couponsCol.findByCode(code.trim());
    if (!coupon) return res.json({ success: false, message: "Invalid coupon code." });
    if (!coupon.active) return res.json({ success: false, message: "This coupon is inactive." });
    if (new Date(coupon.expiry) < new Date()) return res.json({ success: false, message: "This coupon has expired." });
    if (coupon.used >= coupon.maxUses) return res.json({ success: false, message: "This coupon has been fully used." });

    const amount = Number(orderAmount) || 0;
    if (coupon.minOrder > 0 && amount < coupon.minOrder) {
      return res.json({ success: false, message: `Minimum order ₹${coupon.minOrder} required for this coupon.` });
    }

    let discount: number;
    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = Math.round((amount * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, amount);

    res.json({ success: true, discount, coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
