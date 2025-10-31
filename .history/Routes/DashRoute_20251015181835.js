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

router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
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
    return res.render("adminDash", {
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

// approve a user
router.post("/admin/approve/:id", isLoggedIn,isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.params.id, { isApproved: true });
    // optional: send email to user notifying approval
    res.redirect("/admin"); // ya admin dashboard page
  } catch (error) {
    console.log(error);
    res.status(500).send("Error aproving user");
  }
});

// reject/delete
router.post("/admin/reject/:id", isLoggedIn,isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin"); // ya admin dashboard page
  } catch (error) {
    console.log(error);
    res.status(500).send("Error rejecting user");
  }
});
router.get("/delete-user/:id", isLoggedIn, async function (req, res) {
  try {
    const userIdToDelete = req.params.id;
if
    // Admin khud ko delete na kar paye
    if (userIdToDelete === req.userId.toString()) {
      return res.status(400).send("Error: Admin cannot delete themselves!");
    }

    const deletedUser = await userModel.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).send("Error: User not found");
    }

    console.log(`Successfully deleted user: ${deletedUser.name}`);
    res.redirect("/admin"); // ya admin dashboard page
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

module.exports = router;
