const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
router.get("/", function (req, res) {
  res.render("home");
});
router.get("/register", (req, res) => {
  res.render("register");
});



router.post("/register", async (req, res) => {
  let { name, email, password } = req.body;

  try {
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
