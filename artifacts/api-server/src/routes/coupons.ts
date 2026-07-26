import { Router, type IRouter, type Request, type Response } from "express";
import { couponsCol } from "../lib/firestoreDb";
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

const ALLOWED_COUPON_TYPES = new Set(["flat", "percent"]);

// ── GET /admin/coupons ─────────────────────────────────────────────────────────
router.get("/admin/coupons", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const coupons = await couponsCol.findAll();
    res.json({ success: true, coupons });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch coupons." });
  }
});

// ── POST /admin/coupons ────────────────────────────────────────────────────────
router.post("/admin/coupons", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const { code, type, value, minOrder, maxUses, expiry, active, description, maxDiscount } = req.body;
    if (!code || !type || value === undefined) {
      res.status(400).json({ success: false, message: "code, type and value are required." }); return;
    }

    const cleanCode = sanitizeString(code, LIMITS.COUPON_CODE).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!cleanCode) { res.status(400).json({ success: false, message: "Invalid coupon code." }); return; }

    if (!ALLOWED_COUPON_TYPES.has(String(type))) {
      res.status(400).json({ success: false, message: "type must be 'flat' or 'percent'." }); return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100000) {
      res.status(400).json({ success: false, message: "Invalid coupon value." }); return;
    }

    // Check duplicate
    const existing = await couponsCol.findByCode(cleanCode);
    if (existing) {
      res.status(409).json({ success: false, message: "Coupon code already exists." }); return;
    }

    const coupon = await couponsCol.create({
      code: cleanCode,
      type: String(type) as "flat" | "percent",
      value: numValue,
      minOrder: Math.max(0, Number(minOrder) || 0),
      maxUses: Math.min(100000, Math.max(1, Number(maxUses) || 100)),
      used: 0,
      expiry: sanitizeString(expiry, 20) || "2026-12-31",
      active: active ?? true,
      description: sanitizeString(description, 500),
      ...(maxDiscount ? { maxDiscount: Math.max(0, Number(maxDiscount)) } : {}),
    });
    res.json({ success: true, coupon });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create coupon." });
  }
});

// ── PATCH /admin/coupons/:id ───────────────────────────────────────────────────
router.patch("/admin/coupons/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const updates: Record<string, unknown> = {};
    const body = req.body as Record<string, unknown>;
    // Whitelist fields
    if (body.code !== undefined) updates.code = sanitizeString(body.code, LIMITS.COUPON_CODE).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (body.type !== undefined) {
      if (!ALLOWED_COUPON_TYPES.has(String(body.type))) {
        res.status(400).json({ success: false, message: "type must be 'flat' or 'percent'." }); return;
      }
      updates.type = String(body.type);
    }
    if (body.value !== undefined) updates.value = Math.max(0, Number(body.value));
    if (body.minOrder !== undefined) updates.minOrder = Math.max(0, Number(body.minOrder));
    if (body.maxUses !== undefined) updates.maxUses = Math.max(1, Number(body.maxUses));
    if (body.maxDiscount !== undefined) updates.maxDiscount = Math.max(0, Number(body.maxDiscount));
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.expiry !== undefined) updates.expiry = sanitizeString(body.expiry, 20);
    if (body.description !== undefined) updates.description = sanitizeString(body.description, 500);

    if (!Object.keys(updates).length) {
      res.status(400).json({ success: false, message: "Nothing to update." }); return;
    }
    await couponsCol.update(req.params.id, updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update coupon." });
  }
});

// ── DELETE /admin/coupons/:id ──────────────────────────────────────────────────
router.delete("/admin/coupons/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await couponsCol.delete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete coupon." });
  }
});

// ── POST /coupons/validate (public — called from checkout) ─────────────────────
router.post("/coupons/validate", async (req, res): Promise<void> => {
  try {
    const { code, orderAmount } = req.body as { code?: string; orderAmount?: number };
    if (!code?.trim()) {
      res.status(400).json({ success: false, message: "Coupon code required." }); return;
    }
    const cleanCode = sanitizeString(code, LIMITS.COUPON_CODE).toUpperCase();
    if (!cleanCode || !/^[A-Z0-9_-]{1,50}$/.test(cleanCode)) {
      res.status(400).json({ success: false, message: "Invalid coupon code format." }); return;
    }

    const amount = Math.max(0, Number(orderAmount) || 0);

    const coupon = await couponsCol.findByCode(cleanCode);
    if (!coupon) { res.json({ success: false, message: "Invalid coupon code." }); return; }
    if (!coupon.active) { res.json({ success: false, message: "This coupon is inactive." }); return; }
    if (new Date(coupon.expiry) < new Date()) { res.json({ success: false, message: "This coupon has expired." }); return; }
    if (coupon.used >= coupon.maxUses) { res.json({ success: false, message: "This coupon has been fully used." }); return; }
    if (coupon.minOrder > 0 && amount < coupon.minOrder) {
      res.json({ success: false, message: `Minimum order ₹${coupon.minOrder} required for this coupon.` }); return;
    }

    let discount: number;
    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = Math.round((amount * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, amount);

    res.json({
      success: true, discount,
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to validate coupon." });
  }
});

export default router;
