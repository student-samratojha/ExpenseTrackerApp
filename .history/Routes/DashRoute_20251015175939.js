const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const transactionModel = require("../models/transactionModel");
const userModel = require("../models/userModel");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddliware");
router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const transaction = await transactionModel.find({
      email: req.user.email,
    });

    let total = 0;
    let expense = 0;
    let income = 0;

    transaction.forEach((txn) => {
      if (txn.type === "income") {
        income += txn.amount;
        total += txn.amount;
      } else {
        expense += txn.amount;
        total -= txn.amount;
      }
    });

    res.render("dashboard", { user, transaction, income, total, expense });
  } catch (error) {
    console.log("Dashboard error:", error);
    res.send("❌ Error loading dashboard");
  }
});

router.get("/admin", isLoggedIn,isAdmin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const transaction = await transactionModel.find({
      email: req.user.email,
    });

    let total = 0;
    let expense = 0;
    let income = 0;

    transaction.forEach((txn) => {
      if (txn.type === "income") {
        income += txn.amount;
        total += txn.amount;
      } else {
        expense += txn.amount;
        total -= txn.amount;
      }
    });
      // सभी users fetch करो
      const users = await userModel.find();
      const pending = await userModel.find({ isApproved: false });
      // Admin dashboard render karo
      return res.render("Admindashboard", {
        admin: user,
        pending, transaction, income, total, expense
        users,
      });

  } catch (error) {
    console.log("Admin error:", error);
    res.send("❌ Error loading dashboard");
  }
});


module.exports = router;