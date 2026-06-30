---
name: Replit /api/ path block
description: Replit's HTTPS proxy returns 502 for any path starting with /api/ — Vite proxy won't help, must rename routes.
---

# Replit blocks /api/* paths

**Rule:** Replit's outer HTTPS proxy intercepts any request where the path begins with `/api/` and returns HTTP 502 before the request reaches the Vite dev server. This affects ALL `/api/*` paths regardless of what the dev server does.

**Why:** Replit appears to reserve `/api/` paths at the platform proxy level. Test confirmed: `/` → 200, `/admin` → 200, `/api/orders` → 502, `/health` (proxied via Vite) → 404 (reached backend).

**How to apply:** When building a full-stack app in Replit with Vite on port 5000 and a separate backend on another port:
- Do NOT use `/api/` as the route prefix if you need the proxy to forward to the backend.
- Use a custom prefix like `/ko-api`, `/v1`, `/rpc`, `/backend`, etc.
- Configure Vite proxy: `'/ko-api': { target: 'http://localhost:3000', rewrite: (p) => p.replace(/^\/ko-api/, '/api') }` so the backend still receives `/api/` internally.
- Update all frontend fetch calls to use the new prefix.
