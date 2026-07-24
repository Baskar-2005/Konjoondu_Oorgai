# Konjoondu Oorgai

A handcrafted pickle e-commerce app with customer accounts, order tracking, reviews, and admin tools.

## Run & Operate (Replit)

Two workflows run the app locally on Replit:

| Workflow | Command | Port |
|---|---|---|
| `artifacts/konjoondu-oorgai: web` | `pnpm --filter @workspace/konjoondu-oorgai run dev` | 5000 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |

Install all workspace dependencies first: `pnpm install`

### Required Replit Secrets

| Secret | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Full raw JSON of the Firebase service account key (Firebase Console → Project Settings → Service Accounts → Generate new private key) |
| `ADMIN_SECRET` | Password that protects admin API routes |

> **Note:** `VITE_API_URL` is intentionally **not** set for local dev — the frontend uses the `/ko-api/*` Vite proxy rewrite to reach the local API server. Only set it in Netlify env vars when pointing at the Render production backend.

## Other commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (deployed on Render)
- DB: Firebase Firestore (Admin SDK via `firebase-admin`)
- Frontend: React + Vite (deployed on Netlify)
- Build: esbuild (ESM bundle), `firebase-admin` externalized
- Payments: Razorpay

## Where things live

- `artifacts/api-server/src/lib/firebase.ts` — lazy Firebase Admin init (proxy pattern)
- `artifacts/api-server/src/lib/firestoreDb.ts` — full Firestore CRUD layer (source of truth for all DB ops)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, customers, orders, payments, email, health)
- `artifacts/konjoondu-oorgai/` — React/Vite frontend
- `render.yaml` — Render deployment config
- `netlify.toml` — Netlify config with `/ko-api/*` proxy to Render

## Architecture decisions

- **Firestore over PostgreSQL**: migrated from Drizzle ORM + PostgreSQL to Firebase Firestore Admin SDK. All DB logic lives in `firestoreDb.ts`.
- **Collection layout**: top-level `customers`, `sessions`, `orders`, `issues`; subcollections `/customers/{id}/addresses|wishlist|reviews|notifications`; subcollections `/orders/{id}/items|tracking`. Sessions and issues are top-level for efficient single-field lookups (token, issue ID) without knowing parent doc ID.
- **`customerEmailLower` field**: orders store a lowercased copy of the customer email so case-insensitive email search works in Firestore (which has no `ilike`).
- **Lazy Firebase init**: `firebase.ts` uses a Proxy so the server starts without `FIREBASE_SERVICE_ACCOUNT` set; routes fail gracefully when the env var is missing instead of crashing at boot.
- **Replit /api/ path block**: Replit's HTTPS proxy blocks `/api/*` paths with 502; frontend uses `/ko-api/*` prefix + Vite rewrite to the backend.

## Firestore composite indexes required

Create these in the Firebase console (Firestore → Indexes → Composite):

| Collection | Fields | Order |
|---|---|---|
| `orders` | `customerPhone` ASC, `createdAt` DESC | |
| `orders` | `customerEmailLower` ASC, `createdAt` DESC | |
| `customers/*/addresses` | `isDefault` DESC, `createdAt` DESC | |
| `customers/*/wishlist` | `addedAt` DESC | |

Firebase will also prompt you with console links the first time each query runs in production.

## Product

- Customer accounts with OTP-based phone registration and password auth
- Order placement, tracking, and shipment updates
- Customer portal: addresses, wishlist, reviews, notifications
- Admin endpoints (protected by `ADMIN_SECRET`) for orders, status updates, and issue management
- Razorpay payment integration
- Telegram and email notifications for new orders

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **FIREBASE_SERVICE_ACCOUNT** must be the full raw JSON string (not base64, not a file path).
- `firebase-admin` is in the esbuild `external` list — it must be installed as a runtime dep on Render, not bundled.
- Run `pnpm approve-builds` if `@firebase/util` or `protobufjs` build scripts are blocked after install.
- Frontend `API_BASE` uses `VITE_API_URL ?? '/ko-api'`; backend Render URL goes in `VITE_API_URL` in Netlify env vars.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
