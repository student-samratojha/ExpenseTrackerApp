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
      const pending = await user.find({ isApproved: false });
      const pendingStories = await titleModel
        .find({ isApproved: false })
        .populate("userId");
      // Har user ke stories fetch karo
      const usersWithStories = await Promise.all(
        users.map(async (u) => {
          const stories = await titleModel
            .find({ userId: u._id })
            .sort({ createdAt: -1 });
          return { ...u.toObject(), stories };
        })
      );

      // Admin dashboard render karo
      return res.render("Admindashboard", {
        admin: user,
        pendingStories,
        pending,
        users: usersWithStories,
      });

    res.render("dashboard", { user, transaction, income, total, expense });
  } catch (error) {
    console.log("Dashboard error:", error);
    res.send("❌ Error loading dashboard");
  }
});


module.exports = router;