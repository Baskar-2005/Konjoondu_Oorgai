/**
 * One-time Firestore collection initializer for Konjoondu Oorgai.
 *
 * Run with (from repo root):
 *   FIREBASE_SERVICE_ACCOUNT="$(cat path/to/service-account.json)" \
 *     node --experimental-vm-modules \
 *     --loader $(pwd)/artifacts/api-server/node_modules/.pnpm/... \
 *
 * Simpler — run via pnpm from inside api-server:
 *   cp scripts/init-firestore.mjs artifacts/api-server/init-firestore-temp.mjs
 *   cd artifacts/api-server
 *   FIREBASE_SERVICE_ACCOUNT='<json>' node init-firestore-temp.mjs
 *   rm init-firestore-temp.mjs
 *
 * Creates a _schema document in every collection so they appear in the
 * Firebase console. Schema docs are clearly marked and safe to delete.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!sa) {
  console.error("❌  Set FIREBASE_SERVICE_ACCOUNT to your service-account JSON.");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const MARKER = "__schema";

async function ensure(collectionPath, fields) {
  const ref = db.collection(collectionPath).doc(MARKER);
  const snap = await ref.get();
  if (snap.exists) {
    console.log(`  ✓  ${collectionPath} (already exists)`);
    return;
  }
  await ref.set({
    _note: "Schema marker — safe to delete after first real document is added.",
    _fields: fields,
    _createdAt: new Date(),
  });
  console.log(`  ✅  ${collectionPath}`);
}

async function main() {
  console.log("\n🔥  Konjoondu Oorgai — Firestore collection initializer\n");

  // ── Top-level collections ──────────────────────────────────────────────────

  await ensure("customers", [
    "id", "phone", "email", "name", "dob", "gender",
    "passwordHash", "salt", "profilePicture", "rewardPoints",
    "isVerified", "isFirstLogin", "pendingOtp", "otpExpiry",
    "communicationPrefs", "createdAt", "updatedAt",
  ]);

  await ensure("sessions", [
    "customerId", "token", "expiresAt", "createdAt",
  ]);

  await ensure("orders", [
    "id", "razorpayOrderId", "razorpayPaymentId",
    "customerName", "customerEmail", "customerEmailLower", "customerPhone",
    "shippingAddress", "totalAmount", "status",
    "courierName", "trackingId", "estimatedDelivery",
    "createdAt", "updatedAt",
  ]);

  await ensure("issues", [
    "orderId", "type", "description", "status", "adminReply", "createdAt",
  ]);

  // ── Customer subcollections ────────────────────────────────────────────────
  // Seeded under a demo customer doc so subcollections appear in the console.

  const demoCustomerId = "CUST-DEMO0001";
  const demoCustomerRef = db.collection("customers").doc(demoCustomerId);
  const demoSnap = await demoCustomerRef.get();
  if (!demoSnap.exists) {
    await demoCustomerRef.set({
      _note: "Demo customer — safe to delete.",
      id: demoCustomerId,
      phone: "+910000000000",
      email: "demo@example.com",
      name: "Demo User",
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await ensure(`customers/${demoCustomerId}/addresses`, [
    "customerId", "label", "type", "recipientName", "phone",
    "line1", "line2", "city", "state", "pincode", "country",
    "isDefault", "createdAt", "updatedAt",
  ]);

  await ensure(`customers/${demoCustomerId}/wishlist`, [
    "customerId", "productId", "productName", "price", "image", "size", "addedAt",
  ]);

  await ensure(`customers/${demoCustomerId}/reviews`, [
    "customerId", "orderId", "productId", "productName",
    "rating", "title", "body", "images", "status",
    "adminReply", "helpfulCount", "createdAt", "updatedAt",
  ]);

  await ensure(`customers/${demoCustomerId}/notifications`, [
    "customerId", "type", "title", "body", "isRead", "metadata", "createdAt",
  ]);

  // ── Order subcollections ───────────────────────────────────────────────────

  const demoOrderId = "KO-DEMO0001";
  const demoOrderRef = db.collection("orders").doc(demoOrderId);
  const demoOrderSnap = await demoOrderRef.get();
  if (!demoOrderSnap.exists) {
    await demoOrderRef.set({
      _note: "Demo order — safe to delete.",
      id: demoOrderId,
      customerName: "Demo User",
      customerEmail: "demo@example.com",
      customerEmailLower: "demo@example.com",
      customerPhone: "+910000000000",
      shippingAddress: "Demo Address",
      totalAmount: 0,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await ensure(`orders/${demoOrderId}/items`, [
    "orderId", "productId", "name", "size", "price", "quantity",
  ]);

  await ensure(`orders/${demoOrderId}/tracking`, [
    "orderId", "status", "label", "description", "timestamp", "completed",
  ]);

  // ── Composite index hints ──────────────────────────────────────────────────

  console.log(`
📋  Composite indexes needed (create in Firebase Console → Firestore → Indexes):

  Collection     | Fields
  ─────────────────────────────────────────────────────────────
  orders         | customerPhone ASC  +  createdAt DESC
  orders         | customerEmailLower ASC  +  createdAt DESC
  customers/*/addresses | isDefault DESC  +  createdAt DESC
  customers/*/wishlist  | addedAt DESC

  Firebase will also prompt you with direct links when each query first runs.
`);

  console.log("🎉  All collections initialised. Refresh your Firebase console.\n");
}

main().catch((err) => {
  console.error("❌  Error:", err.message ?? err);
  process.exit(1);
});
