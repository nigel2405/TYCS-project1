// backend/models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
