const mongoose = require("mongoose");
module.exports = mongoose.model("Student", new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rfid: { type: String, unique: true }
}));
