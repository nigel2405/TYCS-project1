const mongoose = require("mongoose");

const UnassignedRFIDSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,       // avoid accidental spaces
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

module.exports = mongoose.model("UnassignedRFID", UnassignedRFIDSchema);

