const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
router.get("/", function (req, res) {
  res.render("home");
});
// Generate captcha
function genCaptcha(length = 5) {
  const digits = "abcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}

router.get("/register", (req, res) => {
  const captcha = genCaptcha();
  res.cookie("captcha", captcha, { httpOnly: true }); // cookie me store
  res.render("register", { captcha, error_msg: null });
});
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('email').isEmail(),              // email valid hona chahiye
  body('password').isLength({ min: 6 }), // password min 8 char
  body('').isInt({ min: 1 })         // age positive integer
],
router.post("/register", async (req, res) => {
  let { name, email, captchacode, password } = req.body;

  try {
    // Captcha check from cookie
    const storedCaptcha = req.cookies.captcha;
    if (
      !storedCaptcha ||
      captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()
    ) {
      const captcha = genCaptcha();
      res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("register", {
        captcha,
        error_msg: "Invalid captcha code",
      });
    }
    // Email validation
    if (!email.endsWith("@gmail.com")) {
      const captcha = genCaptcha();
      res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("register", {
        captcha,
        error_msg: "Please use a valid Gmail address",
      });
    }
    // Optional: clear captcha
    res.clearCookie("captcha");

    let existUser = await userModel.findOne({ email });
    if (existUser) {
      const captcha = genCaptcha();
      res.cookie("captcha", captcha, { httpOnly: true });
      return res.render("register", {
        captcha,
        error_msg:
          "Somthing Went Wrong or User Already registered or Try Logging In",
      });
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async (err, hash) => {
        const user = await userModel.create({
          userName: name,
          email,
          password: hash,
          isApproved: false,
        });
        // console.log(user);
        res.redirect("/login");
      });
    });
  } catch (error) {
    const captcha = genCaptcha();
    res.cookie("captcha", captcha, { httpOnly: true });
    return res.render("register", {
      captcha,
      error_msg: "Registration Error:",
    });
  }
});

module.exports = router;
