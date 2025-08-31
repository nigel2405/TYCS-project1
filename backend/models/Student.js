const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rfidTag: {
      type: String,
      default: null,
    },
    className: {
      type: String,
      required: true, // ✅ belongs only to students
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
