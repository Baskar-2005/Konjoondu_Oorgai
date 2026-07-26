import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ─── Security headers (Helmet) ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by the Netlify/CDN layer; API is JSON-only
    crossOriginEmbedderPolicy: false,
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Require CORS_ORIGIN to be explicitly set. Never fall back to allow-all.
const ALLOWED_ORIGINS: string[] = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// In local development (no CORS_ORIGIN set) allow the Vite dev server and Replit previews.
if (ALLOWED_ORIGINS.length === 0 && process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push(
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://0.0.0.0:5000",
  );
  if (process.env.REPLIT_DEV_DOMAIN) {
    ALLOWED_ORIGINS.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no Origin header (server-to-server, curl, mobile)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.some((o) => origin === o || origin.endsWith(`.${o.replace(/^https?:\/\//, "")}`))) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials: true,
  }),
);

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── Body parsing (with size limit) ──────────────────────────────────────────
// 512 KB is generous for our API; prevents large-payload DoS.
// Product image uploads are base64-encoded (≤5 MB) so that route allows more.
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ extended: true, limit: "512kb" }));

// ─── Global rate limits ───────────────────────────────────────────────────────
// Strict limit for auth/sensitive endpoints (applied per-route below as well)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// Tighter limit for OTP / password reset flows
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Please try again in 1 hour." },
});

// Coupon brute-force protection
const couponLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many coupon attempts. Please wait." },
});

// ─── Apply route-level rate limits before the main router ─────────────────────
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/reset-password", otpLimiter);
app.use("/api/auth/google", authLimiter);
app.use("/api/coupons/validate", couponLimiter);
app.use("/api", generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Global error handler ─────────────────────────────────────────────────────
// Catches synchronous throws and CORS errors. Never leak stack traces.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ success: false, message: "An unexpected error occurred." });
});

export default app;
