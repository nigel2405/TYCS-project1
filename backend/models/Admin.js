const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // 🔗 links to User
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true }
});

module.exports = mongoose.model("Admin", adminSchema);
