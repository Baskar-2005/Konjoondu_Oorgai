import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function ensureInit(): Firestore {
  if (!getApps().length) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!sa) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT environment variable is required. " +
          "Set it to the full JSON of your Firebase service account key.",
      );
    }
    initializeApp({ credential: cert(JSON.parse(sa) as object) });
  }
  return getFirestore();
}

/**
 * Lazy Firestore proxy — Firebase is only initialised when the first
 * database call is made, so the server can start without the env var
 * being set (routes will return 500 until the var is configured).
 */
export const fdb = new Proxy({} as Firestore, {
  get(_t, prop) {
    const db = ensureInit();
    const val = (db as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function"
      ? (val as (...a: unknown[]) => unknown).bind(db)
      : val;
  },
});
