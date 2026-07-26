import { Router, type IRouter, type Request, type Response } from "express";
import path from "path";
import fs from "fs/promises";
import express from "express";
import { fdb } from "../lib/firebase";
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

// Resolve relative to this source file so it is cwd-independent.
const PRODUCTS_DIR = path.resolve(__dirname, "../../../artifacts/konjoondu-oorgai/public/products");

// Strict allowlist of MIME types and their canonical extensions
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// 5 MB max image payload (base64 encoded ≈ 4/3 of binary size)
const MAX_BASE64_LEN = Math.ceil((5 * 1024 * 1024 * 4) / 3);

// Whitelisted product fields for PATCH (prevents mass-assignment via Firestore update)
const ALLOWED_PRODUCT_STRING_FIELDS = new Set([
  "name", "category", "description", "tag", "status",
]);
const ALLOWED_PRODUCT_NUMBER_FIELDS = new Set(["spiceLevel"]);
const ALLOWED_PRODUCT_ARRAY_FIELDS = new Set(["weights", "mrp", "prices"]);

// Larger body limit for image upload routes only
const largeBodyParser = express.json({ limit: "10mb" });

// ── GET /api/admin/products ────────────────────────────────────────────────────
router.get("/admin/products", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const snap = await fdb.collection("products").orderBy("createdAt", "desc").get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, products });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
});

// ── POST /api/admin/products ───────────────────────────────────────────────────
router.post("/admin/products", largeBodyParser, async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const { name, category, description, tag, spiceLevel, weights, mrp, prices, imageBase64, imageType, imageName } = req.body;

    const cleanName = sanitizeString(name, LIMITS.PRODUCT_NAME);
    if (!cleanName || !Array.isArray(weights) || weights.length === 0) {
      res.status(400).json({ success: false, message: "Name and at least one weight are required." }); return;
    }

    // Validate weights, mrp, prices are arrays of strings/numbers
    if (!Array.isArray(mrp) || !Array.isArray(prices)) {
      res.status(400).json({ success: false, message: "mrp and prices must be arrays." }); return;
    }

    // ── Save image ─────────────────────────────────────────────────────────────
    let imagePath = "/products/placeholder.jpg";
    if (imageBase64 && imageType) {
      const ext = ALLOWED_MIME[imageType as string];
      if (!ext) {
        res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed." }); return;
      }
      if (typeof imageBase64 !== "string" || imageBase64.length > MAX_BASE64_LEN) {
        res.status(400).json({ success: false, message: "Image must be under 5 MB." }); return;
      }
      // Verify the base64 string only contains valid base64 characters
      if (!/^[A-Za-z0-9+/]+=*$/.test(imageBase64)) {
        res.status(400).json({ success: false, message: "Invalid image data." }); return;
      }
      await fs.mkdir(PRODUCTS_DIR, { recursive: true });
      const safeName = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const filename = `${safeName}-${Date.now()}.${ext}`;
      await fs.writeFile(path.join(PRODUCTS_DIR, filename), Buffer.from(imageBase64, "base64"));
      imagePath = `/products/${filename}`;
    }

    const spiceLevelNum = Math.min(5, Math.max(1, Number(spiceLevel) || 3));

    const product = {
      name: cleanName,
      category: sanitizeString(category || "Pickle", 100),
      description: sanitizeString(description || "", 2000),
      tag: sanitizeString(tag || "", 100),
      spiceLevel: spiceLevelNum,
      weights: (weights as unknown[]).map((w) => sanitizeString(w, 50)).filter(Boolean),
      mrp: (mrp as unknown[]).map((v) => Math.max(0, Number(v))),
      prices: (prices as unknown[]).map((v) => Math.max(0, Number(v))),
      image: imagePath,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await fdb.collection("products").add(product);
    res.json({ success: true, product: { id: docRef.id, ...product } });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create product." });
  }
});

// ── PATCH /api/admin/products/:id ─────────────────────────────────────────────
// Strict field whitelist — never allow arbitrary fields through to Firestore.
router.patch("/admin/products/:id", largeBodyParser, async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    // String fields
    for (const field of ALLOWED_PRODUCT_STRING_FIELDS) {
      if (field in body) updates[field] = sanitizeString(body[field], LIMITS.GENERIC);
    }
    // Number fields
    for (const field of ALLOWED_PRODUCT_NUMBER_FIELDS) {
      if (field in body) updates[field] = Number(body[field]);
    }
    // Array fields — sanitize each element
    for (const field of ALLOWED_PRODUCT_ARRAY_FIELDS) {
      if (field in body) {
        if (!Array.isArray(body[field])) {
          res.status(400).json({ success: false, message: `${field} must be an array.` }); return;
        }
        if (field === "weights") {
          updates[field] = (body[field] as unknown[]).map((w) => sanitizeString(w, 50)).filter(Boolean);
        } else {
          updates[field] = (body[field] as unknown[]).map((v) => Math.max(0, Number(v)));
        }
      }
    }
    // Image update (optional)
    if (body.imageBase64 && body.imageType) {
      const ext = ALLOWED_MIME[body.imageType as string];
      if (!ext) { res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed." }); return; }
      const b64 = String(body.imageBase64);
      if (b64.length > MAX_BASE64_LEN) { res.status(400).json({ success: false, message: "Image must be under 5 MB." }); return; }
      if (!/^[A-Za-z0-9+/]+=*$/.test(b64)) { res.status(400).json({ success: false, message: "Invalid image data." }); return; }

      const productName = sanitizeString(body.name ?? updates.name ?? id, LIMITS.PRODUCT_NAME);
      const safeName = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const filename = `${safeName}-${Date.now()}.${ext}`;
      await fs.mkdir(PRODUCTS_DIR, { recursive: true });
      await fs.writeFile(path.join(PRODUCTS_DIR, filename), Buffer.from(b64, "base64"));
      updates.image = `/products/${filename}`;
    }

    await fdb.collection("products").doc(id).update(updates);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update product." });
  }
});

// ── DELETE /api/admin/products/:id ────────────────────────────────────────────
router.delete("/admin/products/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await fdb.collection("products").doc(req.params.id).delete();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete product." });
  }
});

export default router;
