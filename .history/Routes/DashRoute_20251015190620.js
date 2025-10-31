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
    const users = await userModel.find({isAppt});
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
router.post("/admin/approve/:id", isLoggedIn, isAdmin, async (req, res) => {
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
router.post("/admin/reject/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin"); // ya admin dashboard page
  } catch (error) {
    console.log(error);
    res.status(500).send("Error rejecting user");
  }
});
// ✅ Delete User Route (Admin or Self-delete allowed)
router.get("/delete-user/:id", isLoggedIn, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // ✅ Agar admin apna khud ka account delete karne ki koshish kare
    if (
      req.user.role === "admin" &&
      userIdToDelete === req.user._id.toString()
    ) {
      return res.status(400).send("❌ Admin cannot delete themselves!");
    }

    // ✅ Allow only: admin OR same user
    if (
      req.user.role === "admin" ||
      req.user._id.toString() === userIdToDelete
    ) {
      const deletedUser = await userModel.findByIdAndDelete(userIdToDelete);

      if (!deletedUser) {
        return res.status(404).send("User not found ❌");
      }

      console.log(`✅ User deleted: ${deletedUser.userName}`);

      // ✅ If admin deleted someone else → go back to admin panel
      if (req.user.role === "admin") {
        return res.redirect("/admin");
      }

      // ✅ If normal user deleted own account → logout and redirect
      res.clearCookie("token");
      return res.redirect("/login");
    }

    // ❌ If not admin or self
    return res.status(403).send("Unauthorized: You can't delete this account!");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error while deleting user");
  }
});

module.exports = router;
