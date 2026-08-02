import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ── Connect to MongoDB ──
connectDB();

const app = express();

// Crucial for Namecheap / Reverse Proxies
app.set("trust proxy", 1);

// ── Security & parsing middleware ──
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Rate limiting ──
// Generous global limit so busy dashboards (many parallel reads) never trip it,
// with a tighter limit only on auth endpoints to deter brute-force attempts.
const isDev = process.env.NODE_ENV !== "production";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS" || req.path === "/health",
  message: {
    success: false,
    message: "You're making requests very quickly. Please slow down for a moment.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 40, // login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many sign-in attempts. Please wait a moment and try again.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Health check ──
app.get("/api/health", (req, res) =>
  res.json({ success: true, service: "Nut Treasury Services API", status: "ok" })
);

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/bank", bankRoutes); // customer banking, loans, tickets
app.use("/api/staff", staffRoutes); // employee + admin queues
app.use("/api/admin", adminRoutes); // admin-only management
app.use("/api", contactRoutes); // exposes /api/contact and /api/newsletter

// ── 404 + error handling ──
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🌰 Nut Treasury Services API running on http://localhost:${PORT} (${
      process.env.NODE_ENV || "development"
    })`
  )
);
