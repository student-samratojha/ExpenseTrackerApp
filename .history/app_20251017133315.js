const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Routes
const LoginRoute = require("./Routes/LoginRoute");
const RegisterRoute = require("./Routes/RegisterRoute");
const DashRoute = require("./Routes/DashRoute");
const AddRoute = require("./Routes/AddRoute");
const DownloadRoute = require("./Routes/DownloadRoute");
// ==========================
// Rate Limiter for sensitive routes
// ==========================
// ⚙️ Set of temporarily blocked IPs
const badIPs = new Set();

// ⏱️ Automatically clear all blocked IPs every 20 minutes
setInterval(() => {
  badIPs.clear();
  console.log("🧹 Cleared blocked IPs list after 20 minutes");
}, 20 * 60 * 1000);

// 🚦 Smart limiter
const smartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5,                   // allowed 5 requests per window
  handler: (req, res) => {
    badIPs.add(req.ip); // 🚫 store the blocked IP
    console.log(`⚠️ IP blocked: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: "Too many requests! You're temporarily blocked for 20 minutes."
    });
  },
  skip: (req, res) => !badIPs.has(req.ip) // limiter runs only for flagged IPs
});
// Helmet enable karna
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://cdn.tailwindcss.com"],
        "style-src": ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
      },
    },
  })
);
// Apply rate limiter only to login & register routes
app.use("/login", authLimiter);
app.use("/register", authLimiter);

// ==========================
// Middleware
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ==========================
// MongoDB Connection
// ==========================
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ==========================
// Routes
// ==========================
app.use(LoginRoute);
app.use(RegisterRoute);
app.use(DashRoute);
app.use(AddRoute);
app.use(DownloadRoute);

// ==========================
// Server
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
