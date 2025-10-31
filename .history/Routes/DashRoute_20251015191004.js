const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const transactionModel = require("../models/transactionModel");
const userModel = require("../models/userModel");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddliware");

// ------------------------
// Dashboard for normal users
// ------------------------
router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const transaction = await transactionModel.find({ email: req.user.email });

    let total = 0,
      income = 0,
      expense = 0;

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

// ------------------------
// Admin Dashboard
// ------------------------
router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const transaction = await transactionModel.find({ email: req.user.email });

    let total = 0,
      income = 0,
      expense = 0;

    transaction.forEach((txn) => {
      if (txn.type === "income") {
        income += txn.amount;
        total += txn.amount;
      } else {
        expense += txn.amount;
        total -= txn.amount;
      }
    });

    // Fetch all approved users and pending users
    const users = await userModel.find({ isApproved: true });
    const pending = await userModel.find({ isApproved: false });

    res.render("adminDash", {
      admin: user,
      pending,
      transaction,
      income,
      total,
      expense,
      users,
    });
  } catch (error) {
    console.log("Admin error:", error);
    res.send("❌ Error loading dashboard");
  }
});

// ------------------------
// Approve pending user
// ------------------------
router.post("/admin/approve/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error approving user");
  }
});

// ------------------------
// Reject / Delete pending user
// ------------------------
router.post("/admin/reject/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error rejecting user");
  }
});

// ------------------------
// Delete user route (Admin or self)
// ------------------------
router.get("/delete-user/:id", isLoggedIn, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Admin cannot delete own account
    if (
      req.user.role === "admin" &&
      userIdToDelete === req.user._id.toString()
    ) {
      return res.status(400).send("❌ Admin cannot delete themselves!");
    }

    // Allow delete if admin OR self
    if (
      req.user.role === "admin" ||
      req.user._id.toString() === userIdToDelete
    ) {
      const deletedUser = await userModel.findByIdAndDelete(userIdToDelete);

      if (!deletedUser) return res.status(404).send("User not found ❌");

      console.log(`✅ User deleted: ${deletedUser.userName}`);

      // Redirect based on role
      if (req.user.role === "admin") return res.redirect("/admin");

      res.clearCookie("token");
      return res.redirect("/login");
    }

    return res.status(403).send("Unauthorized: You can't delete this account!");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error while deleting user");
  }
});

module.exports = router;
