import { Router, type IRouter, type Request, type Response } from "express";
import path from "path";
import fs from "fs/promises";
import { fdb } from "../lib/firebase";

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
// __dirname = artifacts/api-server/src/routes  →  ../../.. = workspace root
const PRODUCTS_DIR = path.resolve(__dirname, "../../../artifacts/konjoondu-oorgai/public/products");

// Strict allowlist of MIME types and their canonical extensions
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// 5 MB max image payload (base64 encoded ≈ 4/3 of binary size)
const MAX_BASE64_LEN = Math.ceil((5 * 1024 * 1024 * 4) / 3);

// ── GET /api/admin/products ────────────────────────────────────────────────────
router.get("/admin/products", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const snap = await fdb.collection("products").orderBy("createdAt", "desc").get();
    const products = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/admin/products ───────────────────────────────────────────────────
router.post("/admin/products", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { name, category, description, tag, spiceLevel, weights, mrp, prices, imageBase64, imageType, imageName } = req.body;

    if (!name || !Array.isArray(weights) || weights.length === 0) {
      return res.status(400).json({ success: false, message: "Name and at least one weight are required." });
    }

    // ── Save image ─────────────────────────────────────────────────────────────
    let imagePath = "/products/placeholder.jpg";
    if (imageBase64 && imageType) {
      // Strict MIME allowlist
      const ext = ALLOWED_MIME[imageType as string];
      if (!ext) {
        return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed." });
      }
      // Size guard (base64 length check)
      if (imageBase64.length > MAX_BASE64_LEN) {
        return res.status(400).json({ success: false, message: "Image must be under 5 MB." });
      }
      await fs.mkdir(PRODUCTS_DIR, { recursive: true });
      const safeName = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const filename = `${safeName}-${Date.now()}.${ext}`;
      await fs.writeFile(path.join(PRODUCTS_DIR, filename), Buffer.from(imageBase64, "base64"));
      imagePath = `/products/${filename}`;
    }

    const product = {
      name: String(name).trim(),
      category: String(category || "Pickle").trim(),
      description: String(description || "").trim(),
      tag: String(tag || "").trim(),
      spiceLevel: Number(spiceLevel) || 3,
      weights: weights as string[],
      mrp: (mrp ?? []) as number[],
      prices: (prices ?? []) as number[],
      image: imagePath,
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await fdb.collection("products").add(product);
    res.json({ success: true, product: { id: docRef.id, ...product } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/admin/products/:id ─────────────────────────────────────────────
router.patch("/admin/products/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    await fdb.collection("products").doc(id).update(updates);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/admin/products/:id ────────────────────────────────────────────
router.delete("/admin/products/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await fdb.collection("products").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
