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
const authLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 5, // Max 5 requests per IP per window
  message: "Too many attempts. Please try again after 20 minutes.",
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
