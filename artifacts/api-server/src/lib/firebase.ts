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
    // Parse and normalise the private key. When pasted through env-var forms
    // the literal "\n" sequences in the PEM block are sometimes stored as the
    // two-character string "\\n" rather than real newlines, which causes gRPC
    // to reject the credential with UNAUTHENTICATED. We fix it here so the
    // secret works regardless of how it was entered.
    const parsed = JSON.parse(sa) as Record<string, unknown>;
    if (typeof parsed.private_key === "string") {
      parsed.private_key = (parsed.private_key as string).replace(/\\n/g, "\n");
    }
    initializeApp({ credential: cert(parsed) });
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
