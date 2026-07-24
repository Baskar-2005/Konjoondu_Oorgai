---
name: Firestore Migration
description: PostgreSQL+Drizzle replaced with Firebase Firestore Admin SDK — collection layout, init pattern, index requirements, and key design decisions.
---

## Collection layout

Top-level: `customers`, `sessions`, `orders`, `issues`
Subcollections of `customers/{id}`: `addresses`, `wishlist`, `reviews`, `notifications`
Subcollections of `orders/{id}`: `items`, `tracking`

**Why top-level for sessions and issues:**
- Sessions need to be queried by `token` without knowing the parent customer ID.
- Issues need to be updated by `issueId` alone (`PATCH /issues/:id`), so they can't live as subcollections of orders.

## Key design decisions

- `customerEmailLower` field on order documents: stores lowercase email so Firestore equality queries work for case-insensitive email lookup (Firestore has no ilike).
- Lazy Firebase init via Proxy: `firebase.ts` exports a `Proxy` over a `Firestore` instance so the server boots without `FIREBASE_SERVICE_ACCOUNT` set (routes 500 on first DB call instead of crashing at startup).
- `firebase-admin` is in esbuild's `external` list — it must not be bundled; it's a runtime dep on Render.

## Required composite indexes

- `orders`: `customerPhone ASC` + `createdAt DESC`
- `orders`: `customerEmailLower ASC` + `createdAt DESC`
- `customers/*/addresses`: `isDefault DESC` + `createdAt DESC`
- Firebase will prompt with console links on first production query.

## Source of truth file

`artifacts/api-server/src/lib/firestoreDb.ts` — all collections, types, and CRUD helpers.

**How to apply:** Any new DB feature must add types + CRUD helpers to `firestoreDb.ts` first, then use them in routes. Never write raw `fdb.collection(...)` calls inside route files.
