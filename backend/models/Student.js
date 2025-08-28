const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // 👈 link to User collection
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);
