const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  userName: String,
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
   isApproved: { type: Boolean, default: false }, // admin approval flag

});

module.exports = mongoose.model("user", userSchema);
