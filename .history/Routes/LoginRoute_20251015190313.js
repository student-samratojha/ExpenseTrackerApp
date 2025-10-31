const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
// Generate captcha
function genCaptcha(length = 5) {
  const digits = "abcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}
// GET Login Page
router.get("/login", (req, res) => {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
  res.render("login", { captcha, error_msg: null }); // initially no error
});

// POST Login Logic
router.post("/login", async function (req, res) {
  const { email, captchacode, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "User not found. Please register first.",
      });
    }

    if (!password) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "Password required.",
      });
    }

    if (!user.password) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "User password not found. Please contact support.",
      });
    }

    if (!user.isApproved) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "Your account is pending admin approval ❌",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "Incorrect password.",
      });
    }

    const storedCaptcha = req.cookies.captcha;
    if (
      !storedCaptcha ||
      captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()
    ) {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("login", {
        captcha
        error_msg: "Invalid captcha code ⚠️",
      });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, { httpOnly: true });
    res.clearCookie("captcha");

    if (user.role === "admin") return res.redirect("/admin");
    else return res.redirect("/dashboard");
  } catch (error) {
    console.log("Login error:", error);
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true });
    res.render("login", {
      captcha
      error_msg: "Something went wrong during login. Please try again.",
    });
  }
});

router.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/login");
});
module.exports = router;
