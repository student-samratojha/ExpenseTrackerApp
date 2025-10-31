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
  res.render("register");
});



router.post("/register", async (req, res) => {
  let { name, email,captchacode, password } = req.body;

  try {
      // Captcha check from cookie
    const storedCaptcha = req.cookies.captcha;
    if (
      !storedCaptcha ||
      captchacode.trim().toLowerCase() !== storedCaptcha.toLowerCase()
    ) {
      req.flash("error_msg", "Invalid captcha code");
      return res.redirect("/signup");
    }
    // Email validation
    if (!email.endsWith("@gmail.com")) {
      console.log("Please use a valid Gmail address");
      return res.redirect("/register");
    }

    let existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.send(
        "Somthing Went Wrong or User Already registered or Try Logging In"
      );
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async (err, hash) => {
        const user = await userModel.create({
          userName: name,
          email,
          password: hash,
        });
        // console.log(user);
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
        res.cookie("token", token).redirect("/dashboard");
      });
    });
  } catch (error) {
    console.log("Registration Error:", error);
    res.send("❌ Something went wrong during registration.");
  }
});

module.exports = router;
