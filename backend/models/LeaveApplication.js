const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    application: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveApplication", leaveApplicationSchema);
