---
name: Firebase service account key rotation
description: What to do when FIREBASE_SERVICE_ACCOUNT gives UNAUTHENTICATED (gRPC code 16).
---

## The rule
`UNAUTHENTICATED` (gRPC code 16) from Firestore does NOT mean the private key has newline issues — it means Google has rejected the JWT signature, which happens when the key in the secret no longer matches what Google has registered (key was revoked or replaced).

**Why:** Firebase service account key files can be revoked in the Firebase Console. If the user uploaded an old `.json` file, the `private_key_id` is stale and Google rejects the JWT with `invalid_grant: Invalid JWT Signature`.

**How to apply:**
1. Diagnose by manually signing a JWT with `crypto.createSign("RSA-SHA256")` and calling `https://oauth2.googleapis.com/token`. If you get `invalid_grant: Invalid JWT Signature`, the key is revoked — not a code bug.
2. Check `private_key_id` in the secret vs the uploaded file — if they match after a "new key" request, the user re-pasted the old file.
3. Direct the user to Firebase Console → Project Settings → Service Accounts → Generate new private key. The new file will have a different `private_key_id`.
4. The `firebase.ts` private-key normalizer (replace `\\n` → `\n`) is still worth keeping for paste-induced encoding issues, but it doesn't fix revoked keys.

## Health route note
The server health check is at `GET /api/healthz` (not `/api/health`). The `render.yaml` points to `/api/health` which returns 404 locally — this is a mismatch but doesn't affect functionality.
