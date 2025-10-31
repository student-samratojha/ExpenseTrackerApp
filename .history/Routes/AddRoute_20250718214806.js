const express = require("express");
const router = express.Router();
const transactionModel = require("../models/transactionModel");
const { isLoggedIn } = require("../middleware/authMiddliware");
router.get("/add", (req, res) => {
  res.render("add");
});
router.post("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    await transactionModel.deleteOne({
      _id: req.params.id,
      email: req.user.email,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log("Delete error:", error);
    res.send("❌ Failed to delete transaction or somthing went wrong");
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  const { amount, type, category } = req.body;
  try {
    const transactionCreated = await transactionModel.create({
      amount,
      type,
      category,
      email: req.user.email,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log("transaction error", error);
    res.send("Failed to Add transaction or somthing went wrong");
  }
});

module.exports = router;
