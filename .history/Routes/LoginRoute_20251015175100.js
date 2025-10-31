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

// Login page
router.get("/login", (req, res) => {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true }); // cookie me store
  res.render("login",{captcha} );
});

router.post("/login", async function (req, res) {
  const { email, captchacode, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send("User not found. Please register first.");
    }

    if (!password) {
      return res.send("Password required.");
    }

    if (!user.password) {
      return res.send("User password not found. Please contact support.");
    }

    if (!user.isApproved) {
      req.flash("error_msg", "Your account is pending admin approval");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.password);
// Optional: clear captcha
    res.clearCookie("captcha");
    if (!match) {
      return res.send("Incorrect password.");
    }

 const storedCaptcha = req.cookies.captcha;
    if (!storedCaptcha || captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()) {
      req.flash("error_msg", "Invalid captcha code");
      return res.redirect("/login");
    }
    const token = jwt.sign({ email: user.email,role:user.role,id:user._id }, process.env.JWT_SECRET);
    res.cookie("token", token).redirect("/dashboard");
 const token = jwt.sign({ uniqueId: user.uniqueId, id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.clearCookie("captcha");


  } catch (error) {
    console.log("Login error:", error);
    res.send("Something went wrong during login.");
  }
});

router.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/login");
});
module.exports = router;