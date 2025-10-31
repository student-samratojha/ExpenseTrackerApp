const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const LoginRoute = require("./Routes/LoginRoute");
const RegisterRoute = require("./Routes/RegisterRoute");
const DashRoute = require("./Routes/DashRoute");
const AddRoute = require("./Routes/AddRoute");
const DownloadRoute = require("./Routes/DownloadRoute");
// Login route ke liye rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per IP
  message: "Too many login attempts. Try again after 15 minutes."
});

app.use('/login', loginLimiter);
app.use('/register', loginLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("error", err);
  });

app.use(LoginRoute);
app.use(RegisterRoute);
app.use(DashRoute);
app.use(AddRoute);
app.use(DownloadRoute);
app.listen(3000, () => {
  console.log("app is running on http://localhost:3000");
});
