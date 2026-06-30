---
name: Customer Account System
description: Architecture and key decisions for the customer auth + account system in Konjoondu Oorgai
---

## Auth Pattern
- Token-based sessions via `x-customer-token` header (NOT admin's `x-admin-token`)
- Token stored in `localStorage` under key `ko_customer_token`
- `getCustomerFromToken(req, res)` in `artifacts/api-server/src/routes/auth.ts` — returns customerId or sends 401 and returns null
- Sessions in `customerSessionsTable`, expire after 30 days

## OTP Safety Rule
**Why:** OTPs must never be returned in API responses in production (account takeover risk).
**How:** `process.env.NODE_ENV !== "production"` gate — `...(isDev ? { otp } : {})` pattern used in both `send-otp` and `forgot-password` routes.

## Issue Endpoint Auth
**Why:** `/orders/:id/issues` must verify customer auth + order ownership (customerPhone must match customer's phone in DB).
**How:** `getCustomerFromToken` + join against `customersTable` to compare phones.

## Frontend Context Provider Order
CustomerProvider wraps WouterRouter in App.tsx. Navigation uses `useCustomer` inside pages (within the router tree) — context IS available. HMR sometimes triggers spurious "outside provider" errors during rapid edits; full page reload resolves them.

## API Proxy Prefix
All frontend calls use `/ko-api` prefix (mapped to `/api` on backend at port 3000). Never use `/api` directly or hardcode `localhost`.

## New DB Tables Added
`customersTable`, `customerSessionsTable`, `addressesTable`, `wishlistTable`, `reviewsTable`, `notificationsTable` — added to `lib/db/src/schema/index.ts`. Requires DB migration (`DATABASE_URL` not yet set in this environment).
