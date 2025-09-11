// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], required: true },
    className: { type: String }, // ✅ store class
    rfid: { type: String, unique: true, sparse: true }, // ✅ store RFID
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
